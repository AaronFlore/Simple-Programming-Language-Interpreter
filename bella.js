// Interpretor for the Bella language
// n: nml
// i: ide
// e: expr = n | i | true | false | uop e | e bop e | i e* | e ? e : e | [ e* ] | e[e]
// s: stm = let i = e | func i i* = e | i = e | print e | while e b
// b: Block = block s*
// p: Program = program b
let memory = new Map();
class Program {
    block;
    constructor(block) {
        this.block = block;
    }
    interpret() {
        return this.block.interpret();
    }
}
class Block {
    statements;
    constructor(statements) {
        this.statements = statements;
    }
    interpret() {
        for (let statement of this.statements) {
            statement.interpret();
        }
    }
}
class VariableDeclaration {
    id;
    expression;
    constructor(id, expression) {
        this.id = id;
        this.expression = expression;
    }
    interpret() {
        if (memory.has(this.id.name)) {
            throw new Error(`Variable already declared`);
        }
        memory.set(this.id.name, this.expression.interpret());
    }
}
class FunctionDeclaration {
    id;
    parameters;
    expression;
    constructor(id, parameters, expression) {
        this.id = id;
        this.parameters = parameters;
        this.expression = expression;
    }
    interpret() {
        if (memory.has(this.id.name)) {
            throw new Error(`Function already declared`);
        }
        memory.set(this.id.name, [this.parameters, this.expression]);
    }
}
class Assignment {
    id;
    expression;
    constructor(id, expression) {
        this.id = id;
        this.expression = expression;
    }
    interpret() {
        if (!memory.has(this.id.name)) {
            throw new Error(`Variable not declared`);
        }
        memory.set(this.id.name, this.expression.interpret());
    }
}
class PrintStatement {
    expression;
    constructor(expression) {
        this.expression = expression;
    }
    interpret() {
        console.log(this.expression.interpret());
    }
}
class WhileStatement {
    expression;
    block;
    constructor(expression, block) {
        this.expression = expression;
        this.block = block;
    }
    interpret() {
        while (this.expression.interpret()) {
            this.block.interpret();
        }
    }
}
class Numeral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
class BooleanLiteral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
class Identifier {
    name;
    constructor(name) {
        this.name = name;
    }
    interpret() {
        if (!memory.has(this.name)) {
            throw new Error(`Variable ${this.name} not declared`);
        }
        return memory.get(this.name);
    }
}
class UnaryExpression {
    operator;
    expression;
    constructor(operator, expression) {
        this.operator = operator;
        this.expression = expression;
    }
    interpret() {
        const value = this.expression.interpret();
        switch (this.operator) {
            case "-":
                return -value;
            case "!":
                return !value;
            case "+":
                return +value;
            default:
                throw new Error(`Unknown unary operator ${this.operator}`);
        }
    }
}
class BinaryExpression {
    operator;
    left;
    right;
    constructor(operator, left, right) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    interpret() {
        const left = this.left.interpret();
        const right = this.right.interpret();
        switch (this.operator) {
            case "+":
                return left + right;
            case "-":
                return left - right;
            case "*":
                return left * right;
            case "/":
                return left / right;
            case "%":
                return left % right;
            case "==":
                return left === right;
            case "!=":
                return left !== right;
            case "<":
                return left < right;
            case ">":
                return left > right;
            case "<=":
                return left <= right;
            case ">=":
                return left >= right;
            case "&&":
                return left && right;
            case "||":
                return left || right;
            default:
                throw new Error(`Unknown binary operator ${this.operator}`);
        }
    }
}
class CallExpression {
    id;
    args;
    constructor(id, args) {
        this.id = id;
        this.args = args;
    }
    interpret() {
        const value = this.id.interpret();
        if (typeof value !== "function") {
            throw new Error(`Cannot call ${value} because it is not a function`);
        }
        else {
            const interpretedArgs = this.args.map((arg) => arg.interpret());
            for (let i = 0; i < interpretedArgs.length; i++) {
                const arg = interpretedArgs[i];
                if (typeof arg !== "number") {
                    throw new Error(`Argument ${i + 1} is not a number`);
                }
            }
            return value(...interpretedArgs);
        }
    }
}
class ConditionalExpression {
    test;
    consequent;
    alternate;
    constructor(test, consequent, alternate) {
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    interpret() {
        return this.test.interpret()
            ? this.consequent.interpret()
            : this.alternate.interpret();
    }
}
class ArrayLiteral {
    elements;
    constructor(elements) {
        this.elements = elements;
    }
    interpret() {
        return this.elements.map((element) => element.interpret());
    }
}
class SubscriptExpression {
    array;
    index;
    constructor(array, index) {
        this.array = array;
        this.index = index;
    }
    interpret() {
        const arrayValue = this.array.interpret();
        const indexValue = this.index.interpret();
        if (Array.isArray(arrayValue) && typeof indexValue === "number") {
            return arrayValue[indexValue];
        }
        else {
            throw new Error("SubscriptExpression: invalid expression");
        }
    }
}
// Sample Program to test interpreter
const sample = new Program(new Block([
    new PrintStatement(new UnaryExpression("-", new Numeral(5))),
    new PrintStatement(new BinaryExpression("*", new Numeral(5), new Numeral(8))),
    new PrintStatement(new ConditionalExpression(new BooleanLiteral(true), new Numeral(5), new Numeral(8))),
    new PrintStatement(new ArrayLiteral([new Numeral(1), new Numeral(2), new Numeral(3)])),
    new PrintStatement(new SubscriptExpression(new ArrayLiteral([new Numeral(1), new Numeral(2), new Numeral(3)]), new Numeral(1))),
]));
function interpret(p) {
    return p.interpret();
}
interpret(sample);
export {};
