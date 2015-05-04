var _, run, load, save, parse, walk, walkers, generate, js_beautify, signature, js, ast, dsl, CLOSURE, ROOT, MAPPING
_ = require("lodash")
run = require('child_process').execFileSync
load = require("fs").readFileSync
save = require("fs").writeFileSync
parse = require("acorn").parse
walk = require("acorn/dist/walk").ancestor
walkers = require("acorn/dist/walk").base
generate = require("escodegen").generate
js_beautify = require('js-beautify').js_beautify

// Override some default acorn walkers because they don't do the right thing
walkers.Function = function (node, st, c) {
  if (node.id) c(node.id, st)
  for (var i = 0; i < node.params.length; i++) {
    c(node.params[i], st)
  }
  c(node.body, st, "ScopeBody")
}
walkers.VariableDeclaration = function (node, st, c) {
  for (var i = 0; i < node.declarations.length; i++) {
    c(node.declarations[i], st)
  }
}
walkers.VariableDeclarator = function (node, st, c) {
  c(node.id, st)
  if (node.init) c(node.init, st, "Expression")
}

// Load the game code, beautify it and save it
/*
js = run("curl", ["http://agar.io/main_out.js"], {stdio: ["pipe","pipe","ignore"]}).toString()
signature = hash(js)
js = beautify(js)
save("game.raw.js", js)
/*/js = load("game.raw.js").toString()

// Abort de-obfuscation if we detect the dev uploaded non-minified code
if (~js.indexOf("DOUBLE_BUFFER")) {
  console.log("Production JS is un-minified. Aborting.")
  return
}

// De-minify the JS
ast = parse(js)
CLOSURE = ast.body[0].expression
ROOT = CLOSURE.callee
MAPPING = {}

// Run 3 times because I'm too lazy to figure out a way to not throw this in a loop
// At the very least we need to rewriteLogical -> splitSequence -> rewriteLogical
for (var i = 0; i < 3; i++) {
  walk(ast, {
    IfStatement: ensureBlock(["consequent", "alternate"]),
    WithStatement: ensureBlock(["body"]),
    ForStatement: ensureBlock(["body"]),
    ForInStatement: ensureBlock(["body"]),
    WhileStatement: ensureBlock(["body"]),
    DoWhileStatement: ensureBlock(["body"]),
  })
  walk(ast, { LogicalExpression: rewriteLogical })
  walk(ast, { ConditionalExpression: rewriteConditional })
  walk(ast, {
    IfStatement: exportSequence("test"),
    ForStatement: exportSequence("init"),
  })
  walk(ast, {
    VariableDeclaration: splitVars,
    SequenceExpression: splitSequence,
  })
  walk(ast, { UnaryExpression: rewriteTrueFalse })
}
// TODO: Why do we need to run this twice??? Why does it break everything when put in the loop above???
walk(ast, { VariableDeclaration: hoistVars })
walk(ast, { VariableDeclaration: hoistVars })

// Replace variable names
var found = 0
// First, build a list of what variables are in each function's scope
walk(ast, {
  Function: saveParamsToScope,
  VariableDeclaration: saveVarsToScope,
})
// Next, replace the closure's arguments
zip([ROOT.params, CLOSURE.arguments]).forEach(function (r) {
  replaceVar(ROOT, r[0].name, r[1].name)
})
// Next, replace all `x = function (y) {...}` with `x = function (e) {...}` (ensure the param is named "e")
walk(ast, {
  AssignmentExpression: function (node, state) {
    if (node.right.type !== "FunctionExpression") return
    var func = node.right
    if (func.params.length) {
      // Unlikely, but possible
      if (~func.params.map(function (x) { return x.name }).indexOf("e")) {
        replaceVar(func, "e", "_e") // If the obfusicator starts using _e I'll just give up
      }
      replaceVar(func, func.params[0].name, "e")
    } else {
      func.params.push({
        type: 'Identifier',
        name: 'e',
      })
    }
  },
})
// Now repeatedly parse our DSL definitions until we can't replace any more
dsl = parse(load("dsl.js"))
var parsed_dsl = {
  AssignmentExpression: [],
  CallExpression: [],
  ConditionalExpression: [],
  LogicalExpression: [],
  Function: [],
};
var generators = {
  AssignmentExpression: function (node) { return [
    node.left.type !== "Literal" ? generate(node.left) : false,
    node.operator,
    node.right.type !== "Literal" ? generate(node.right) : false
  ]},
  CallExpression: function (node) { return [node.callee].concat(node.arguments).map(function (node) { return generate(node) }) },
  ConditionalExpression: function (node) { return [node.test, node.consequent, node.alternate].map(function (node) { return generate(node) }) },
  LogicalExpression: function (node) { return [
    node.left.type !== "Literal" ? generate(node.left) : false,
    node.operator,
    node.right.type !== "Literal" ? generate(node.right) : false
  ]},
  Function: function (node) {
    var n = _.cloneDeep(node)
    walk(n, function (f) { f.type = "EmptyStatement" })
    var parts = [n.body].concat(node.params)
    if (n.id) parts.push(n.id)
    parts = parts.map(function (node) { return generate(node) })
    parts[0] = parts[0].slice(2,-3).trim() // Remove braces and final ;
    return parts
  },
}
parsed_dsl.FunctionExpression = parsed_dsl.FunctionDeclaration = parsed_dsl.Function
generators.FunctionExpression = generators.FunctionDeclaration = generators.Function

walk(dsl, {
  Function: function (node, state) { parsed_dsl[node.type].push(generators[node.type](node)) },
  AssignmentExpression: function (node, state) { if(!_.intersection(_.pluck(state, "type"), ["FunctionExpression", "FunctionDeclaration"]).length) parsed_dsl[node.type].push(generators[node.type](node)) },
  ConditionalExpression: function (node, state) { if(!_.intersection(_.pluck(state, "type"), ["FunctionExpression", "FunctionDeclaration"]).length) parsed_dsl[node.type].push(generators[node.type](node)) },
  // Restrict the following to top level only to make the DSL more explicit
  CallExpression: function (node, state) { if (state.length === 3) parsed_dsl[node.type].push(generators[node.type](node)) },
  LogicalExpression: function (node, state) { if (state.length === 3) parsed_dsl[node.type].push(generators[node.type](node)) },
})
//console.log(parsed_dsl)

do {
  found = 0
  walk(ast, {
    AssignmentExpression: findAndReplace,
    CallExpression: findAndReplace,
    ConditionalExpression: findAndReplace,
    LogicalExpression: findAndReplace,
    Function: functionFindAndReplace,
  })
} while (found)

// Beautify again and save
walk(ast, { VariableDeclaration: hoistVars })
js = generate(ast)
js = beautify(js)
save("game.js", js)

// Update the mapping
js = load("../mapping.js")
ast = parse(js);
(function (M, k, v) {
  var i
  for (i = 0; i < M.length; i++) {
    if (M[i].key.value === k) break
  }
  M.splice(i, 1, {
    type: "Property",
    kind: "init",
    key: {type: "Literal", value: k},
    value: parse("_=" + JSON.stringify(v)).body[0].expression.right,
  })
})(ast.body[0].expression.arguments[0].properties, signature, MAPPING)
js = generate(ast)
js = beautify(js)
save("../mapping.js", js)
console.log(MAPPING)

// Extremely basic string hasher
// http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
function hash(str) {
    for (var hash = 0, len = str.length, i = 0; i < len; ++i)
      hash = hash * 31 + str.charCodeAt(i) | 0
    return hash >>> 0
}

// Emulate python's array zip
// http://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
function zip(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}

// Ensure consistent parameters
function beautify(js) {
  return js_beautify(js, {
    indent_size: 2,
    max_preserve_newlines: 2,
    jslint_happy: true,
    space_after_anon_function: true,
    end_with_newline: true,
    good_stuff: true
  })
}

// BEFORE: while (x < 10) x++;
// AFTER:  while (x < 10) { x++; }
function ensureBlock(properties) {
  return function (node, state) {
    properties.forEach(function (prop) {
      if (!node[prop]) return
      if (node[prop].type === "BlockStatement") return

      node[prop] = {
        type: "BlockStatement",
        body: [node[prop]]
      }
    })
  }
}

// BEFORE: x && y && (z(), zz = 1);
// AFTER:  if(x && y) { z(); zz = 1; }
function rewriteLogical(node, state) {
  // NOTE: Logicals are parsed right to left
  // So node.left contains the entire conditional we care about
  // How convenient!
  if (!~["SequenceExpression", "CallExpression", "AssignmentExpression"].indexOf(node.right.type)) return
  var parent = state[state.length - 2]
  // TODO: Accept more types here
  if (parent.type !== "ExpressionStatement") return
  parent.expression = {
    type: "IfStatement",
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
  }
}

// BEFORE: x ? y : z;
// AFTER: if (x) { y; } else { z; }
// ONLY IF: the conditional isn't used by it's parent
function rewriteConditional(node, state) {
  var parent = state[state.length - 2]
  if (!~["ExpressionStatement", "SequenceExpression"].indexOf(parent.type)) return
  node.type = "IfStatement"
  node.consequent = {
    type: "BlockStatement",
    body: [{
      type: "ExpressionStatement",
      expression: node.consequent
    }]
  }
  node.alternate = node.alternate && {
    type: "BlockStatement",
    body: [{
      type: "ExpressionStatement",
      expression: node.alternate
    }]
  }
}

// BEFORE: if (a = r[e], a.shouldRender())
// AFTER:  a = r[e]; if (a.shouldRender())
function exportSequence(prop) {
  return function (node, state) {
    if (!node[prop]) return
    if (!~["VariableDeclaration", "SequenceExpression"].indexOf(node[prop].type)) return

    var parent = state[state.length - 2]
    var index = parent.body.indexOf(node)

    if (node[prop].type === "VariableDeclaration") {
      var vars = node[prop].declarations
      var main = vars[vars.length - 1]
      var assignment = {
        type: "AssignmentExpression",
        operator: "=",
        left: main.id,
        right: main.init
      }
      main.init = null
      parent.body.splice(index, 0, node[prop])
      node[prop] = assignment
    }

    if (node[prop].type === "SequenceExpression") {
      parent.body.splice(index, 0, node[prop])
      node[prop] = node[prop].expressions.pop()
    }
  }
}

// BEFORE: var a = 1, b = 2;
// AFTER:  var a = 1; var b = 2;
function splitVars(node, state) {
  if (node.declarations.length <= 1) return
  var parent = state[state.length - 2]
  var index = parent.body.indexOf(node)
  var splitted = []
  node.declarations.forEach(function (d) {
    splitted.push({
      type: "VariableDeclaration",
      kind: node.kind,
      declarations: [d]
    })
  })
  parent.body.splice.apply(parent.body, [index, 1].concat(splitted))
}

// BEFORE: (a = 1, b = 2)
// AFTER:  a = 1; b = 2;
function splitSequence(node, state) {
  var prop = "body"
  var lookup = node
  var parent = state[state.length - 2]
  if (parent.type === "ExpressionStatement") {
    lookup = parent
    parent = state[state.length - 3]
  }
  if (parent.type === "SwitchStatement") {
    prop = "consequent"
    // Extract the case
    for (var i = 0; i < parent.cases.length; i++) {
      if (~parent.cases[i][prop].indexOf(lookup)) {
        parent = parent.cases[i]
        break
      }
    }
  }
  if (!parent[prop]) return
  var index = parent[prop].indexOf(lookup)
  var splitted = []
  node.expressions.forEach(function (e) {
    splitted.push({
      type: "ExpressionStatement",
      expression: e
    })
  })
  parent[prop].splice.apply(parent[prop], [index, 1].concat(splitted))
}

// BEFORE: a = !0; b = !1;
// AFTER:  a = true; b = false;
function rewriteTrueFalse(node, state) {
  if (!node.prefix || node.operator !== "!" || node.argument.type !== "Literal") return
  if (node.argument.value === 0) {
    node.type = "Literal"
    node.value = true
  }
  if (node.argument.value === 1) {
    node.type = "Literal"
    node.value = false
  }
}

// BEFORE: function () { x(); var y = z; }
// AFTER:  function () { var y; x(); y = z; }
function hoistVars(node, state) {
  if (node.kind !== "var") return // IDK if we can hoist "let" and "const"
  var parent = state[state.length - 2]
  var body = getCurrentScope(state).body.body
  var splitted = []

  if (!body.length || !body[0].isHoistedVars) {
    body.unshift({
      type: "VariableDeclaration",
      kind: "var",
      declarations: [],
      isHoistedVars: true, // Cheat to ensure we parse all vars at least once
    })
  }

  // Don't mess with ourselves
  if (body[0] === node) {
    body[0].declarations = _.sortBy(_.unique(body[0].declarations, "id.name"), "id.name")
    return
  }

  node.declarations.forEach(function (d) {
    body[0].declarations.push({
      type: "VariableDeclarator",
      id: d.id,
      init: null,
    })
    if (d.init) {
      splitted.push({
        type: "ExpressionStatement",
        expression: {
          type: "AssignmentExpression",
          operator: "=",
          left: d.id,
          right: d.init,
        }
      })
    }
  })

  if (parent.type === "ForInStatement") {
    // Oh fuck it, when will this ever not work anyway?
    node.type = "Identifier"
    node.name = node.declarations[0].id.name
  } else {
    var index = parent.body.indexOf(node)
    parent.body.splice.apply(parent.body, [index, 1].concat(splitted))
  }
  body[0].declarations = _.sortBy(_.unique(body[0].declarations, "id.name"), "id.name")
}

// Saves a function's params to it's scope
// Also saves it's name to it's parent scope
function saveParamsToScope(node, state) {
  if (!node.scope) node.scope = {}
  node.params.forEach(function (param) {
    node.scope[param.name] = true
  })
  if (node.id) {
    var func = getCurrentScope(state.slice(0, -1))
    if (!func.scope) func.scope = {}
    func.scope[node.id.name] = true
  }
}

// Saves a var declaration to the closest function scope
function saveVarsToScope(node, state) {
  var func = getCurrentScope(state)
  if (!func.scope) func.scope = {}
  node.declarations.forEach(function (v) {
    func.scope[v.id.name] = true
  })
}

// Finds a DSL rule that's one variable away from what we have
// Then replaces the bad variable
// Handles self-referential expressions (e.g. `x = x + y` -> `z = z + y`)
function findAndReplace(node, state) {
  var comp, parts, c, func
  parts = generators[node.type](node)
  for (var i = 0; i < parsed_dsl[node.type].length; i++) {
    comp = parsed_dsl[node.type][i]
    if (parts.length != comp.length) continue

    for (var j = 0; j < parts.length; j++) {
      if (parts[j] === comp[j]) continue
      if (parts[j] === false) continue
      if (~parts[j].indexOf(".")) continue

      c = _.cloneDeep(node)
      walk(c, { Identifier: function (node, state) { if (node.name === parts[j]) node.name = comp[j] }})
      if (_.isEqual(comp, generators[node.type](c))) {
        func = getScope(parts[j], state)
        if (!func) console.log(state, parts[j], comp[j])
        replaceVar(func, parts[j], comp[j])
        return
      }
    }
  }
}

// Special case function definitions
function functionFindAndReplace(node, state) {
  var comp, parts, func
  parts = generators[node.type](node)
  for (var i = 0; i < parsed_dsl[node.type].length; i++) {
    comp = parsed_dsl[node.type][i]
    if (parts.length != comp.length) continue
    if (!~parts[0].indexOf(comp[0])) continue

    for (var j = 1; j < parts.length; j++) {
      if (parts[j] === comp[j]) continue
      func = getScope(parts[j], state)
      if (!func) console.log(state, parts[j], comp[j])
      replaceVar(func, parts[j], comp[j])
    }
    return
  }
}

// Replaces variable identifiers, accounting for scoping
function replaceVar(func, oldVar, newVar) {
  walk(ast, {
    Identifier: function (node, state) {
      if (node.name !== oldVar) return
      var f = getScope(oldVar, state)
      if (f === func) {
        node.name = newVar
        found++
      }
    }
  })
  delete func.scope[oldVar]
  func.scope[newVar] = true
  if (func === ROOT) MAPPING[oldVar] = newVar
}

function getScope(v, state) {
  var f
  for (var i = state.length - 1; i >= 0; i--) {
    if (state[i].scope && state[i].scope[v]) {
      f = state[i]
      break
    }
  }
  return f
}

function getCurrentScope(state) {
  var func
  for (var i = state.length - 1; i >= 0; i--) {
    if (~["FunctionDeclaration","FunctionExpression"].indexOf(state[i].type)) {
      func = state[i]
      break
    }
  }
  return func
}
