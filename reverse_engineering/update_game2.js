// Import libraries
var _, run, load, save, _parse, traverse, query, getScopes, generate, _beautify;
_ = require("lodash");
run = require('child_process').execFileSync;
load = require("fs").readFileSync;
save = require("fs").writeFileSync;
_parse = require("esprima").parse;
traverse = require("estraverse").traverse;
query = require("esquery");
getScopes = require("escope").analyze;
generate = require("escodegen").generate;
_beautify = require('js-beautify').js_beautify;

// Initialize variables
var js, ast;

// Load the game code, beautify it and save it
js = load("game.raw.js").toString();

// Abort de-obfuscation if we detect the dev uploaded non-minified code
if (~js.indexOf("DOUBLE_BUFFER")) {
  console.log("Production JS is un-minified. Aborting.");
  return;
}

// De-minify the JS
ast = parse(js);
for (var i = 0; i < 3; i++) {
  // TODO: Handle nesting better
  ensureBlockStatementsEverywhere(ast);
  rewriteCompressedIfStatements(ast);
  ensureOneExpressionInIfAndFor(ast);
  splitSequences(ast);
  uncompressBooleans(ast);
}
hoistVars(ast); // Only do this once, it's more expensive

// De-obfusicate the JS

// Beautify again and save
js = generate(ast)
js = beautify(js)
save("game2.js", js)




// =================================================================================
// =================================================================================
// =================================================================================

// An enhanced version of esprima.parse that adds metadata to each node
function parse(js) {
  var ast = _parse(js);
  traverse(ast, { enter: function (node, parent) { node.parent = parent; } });
  return ast;
}

// A wrapper for js_beautify that sets our desired options
function beautify(js) {
  return _beautify(js, {
    indent_size: 2,
    max_preserve_newlines: 2,
    jslint_happy: true,
    space_after_anon_function: true,
    end_with_newline: true,
    good_stuff: true
  });
}

// Finds conditionals & loops without braces and adds them
function ensureBlockStatementsEverywhere(ast) {
  // BEFORE: if (x) y();
  // AFTER:  if (x) { y(); }
  query(ast, 'IfStatement[consequent.type!="BlockStatement"]').forEach(setPropertyToBlock("consequent"));
  query(ast, 'IfStatement[alternate][alternate.type!="BlockStatement"]').forEach(setPropertyToBlock("alternate"));
  query(ast, 'WithStatement[body.type!="BlockStatement"]').forEach(setPropertyToBlock("body"));
  query(ast, 'ForStatement[body.type!="BlockStatement"]').forEach(setPropertyToBlock("body"));
  query(ast, 'ForInStatement[body.type!="BlockStatement"]').forEach(setPropertyToBlock("body"));
  query(ast, 'WhileStatement[body.type!="BlockStatement"]').forEach(setPropertyToBlock("body"));
  query(ast, 'DoWhileStatement[body.type!="BlockStatement"]').forEach(setPropertyToBlock("body"));
}
function setPropertyToBlock(prop) {
  return function (node) {
    node[prop] = {
      type: "BlockStatement",
      body: [node[prop]]
    };
    node[prop].parent = node;
    node[prop].body[0].parent = node[prop];
  };
}

// Find If statements disguised as comparisons or ternaries
function rewriteCompressedIfStatements(ast) {
  // BEFORE: x && y && (z(), zz = 1);
  // AFTER:  if(x && y) { z(); zz = 1; }
  query(ast, 'ExpressionStatement > LogicalExpression[right.type=/SequenceExpression|CallExpression|AssignmentExpression/]').forEach(function (node) {
    // NOTE: Logicals are parsed right to left
    // So node.left contains the entire conditional we care about
    // How convenient!
    node.parent.expression = {
      type: "IfStatement",
      // if the operator is `||` we need to negate the whole conditional
      test: node.operator === "&&" ? node.left : {
        type: "UnaryExpression",
        operator: "!",
        prefix: true,
        argument: node.left
      },
      consequent: {
        type: "BlockStatement",
        body: [{
          type: "ExpressionStatement",
          expression: node.right
        }]
      }
    };
    // Clean up .parent references
    node.left.parent = node.parent.expression.test;
    node.right.parent = node.parent.expression.consequent.body[0];
    node.parent.expression.parent = node.parent;
    node.parent.expression.test.parent = node.parent.expression;
    node.parent.expression.consequent.parent = node.parent.expression;
    node.parent.expression.consequent.body[0].parent = node.parent.expression.consequent;
  });

  // BEFORE: x ? y() : z();
  // AFTER: if (x) { y(); } else { z(); }
  query(ast, '*:matches(ExpressionStatement, SequenceExpression) > ConditionalExpression').forEach(function (node) {
    node.type = "IfStatement";
    node.consequent = {
      type: "BlockStatement",
      body: [{
        type: "ExpressionStatement",
        expression: node.consequent
      }]
    };
    node.alternate = node.alternate && {
      type: "BlockStatement",
      body: [{
        type: "ExpressionStatement",
        expression: node.alternate
      }]
    };
    // Clean up .parent references
    node.consequent.parent = node;
    node.consequent.body[0].parent = node.consequent;
    node.consequent.body[0].expression.parent = node.consequent.body[0];
    if (node.alternate) {
      node.alternate.parent = node;
      node.alternate.body[0].parent = node.alternate;
      node.alternate.body[0].expression.parent = node.alternate.body[0];
    }
  });
}

// Ensures If and For only have one expression to evaluate, making it easier to read
function ensureOneExpressionInIfAndFor(ast) {
  // BEFORE: if (a = r[e], a.shouldRender())
  // AFTER:  (a = r[e]) if (a.shouldRender())
  // NOTE: Yes, exporting a sequence is expected and fine. We'll clean it up later.
  query(ast, 'IfStatement[test.type=/VariableDeclaration|SequenceExpression/]').forEach(exportSequence("test"));

  // BEFORE: for (var x = 0, y = 0; y < 10; y++) { z(y); }
  // AFTER:  var x = 0, y; for (y = 0; y < 10; y++) { z(y); }
  query(ast, 'ForStatement[init.type=/VariableDeclaration|SequenceExpression/]').forEach(exportSequence("init"));
}
function exportSequence(prop) {
  return function (node) {
    var index = node.parent.body.indexOf(node);

    if (node[prop].type === "VariableDeclaration") {
      var vars = node[prop].declarations;
      var main = vars[vars.length - 1];
      var assignment = {
        parent: node,
        type: "AssignmentExpression",
        operator: "=",
        left: main.id,
        right: main.init
      };
      main.init = null;
      node[prop].parent = node.parent;
      node.parent.body.splice(index, 0, node[prop]);
      node[prop] = assignment;
    }

    if (node[prop].type === "SequenceExpression") {
      node.parent.body.splice(index, 0, node[prop]);
      node[prop] = node[prop].expressions.pop();
      node.parent.body[index].parent = node.parent;
    }
  }
}

// Extracts the expressions from sequences: (a = b, c = d, x && y())
function splitSequences(ast) {
  // BEFORE: (a = 1, b = 2)
  // AFTER:  a = 1; b = 2;
  query(ast, 'SequenceExpression').forEach(function (node) {
    var prop = "body";
    var container = node.parent;
    var self = node;
    if (container.type === "ExpressionStatement") {
      self = container;
      container = container.parent;
    }
    if (container.type === "SwitchCase") {
      prop = "consequent";
    }
    if (!container[prop]) return;
    var index = container[prop].indexOf(self);
    var splitted = [];
    node.expressions.forEach(function (expression) {
      var statement = {
        type: "ExpressionStatement",
        expression: expression
      };
      statement.parent = container;
      expression.parent = statement;
      splitted.push(statement);
    });
    container[prop].splice.apply(container[prop], [index, 1].concat(splitted));
  });
}

// Does what it says...
function uncompressBooleans(ast) {
  // BEFORE: a = !0; b = !1;
  // AFTER:  a = true; b = false;
  query(ast, 'UnaryExpression[prefix][operator="!"][argument.type="Literal"]').forEach(function (node) {
    if (!node.prefix) console.log(node);
    node.type = "Literal";
    node.value = !node.argument.value;
  });
}

// Moves variable declarations to the top of their scope
function hoistVars(ast) {
  var scopes = getScopes(ast);
  console.log(scopes.__nodeToScope);
  return
  query(ast, 'VariableDeclaration').forEach(function (node) {
    var scope = scopes.__get(node);
    console.log("=================================================================================");
    console.log(scope);
    console.log("=================================================================================");
    console.log(node);
    console.log("=================================================================================");
  });
}

