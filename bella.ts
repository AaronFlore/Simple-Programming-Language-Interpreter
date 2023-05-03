// Interpretor for the Bella language
// n: nml
// i: ide
// e: expr = n | i | true | false | uop e | e bop e | i e* | e ? e : e | [ e* ] | e[e]
// s: stm = let i = e | func i i* = e | i = e | print e | while e b
// b: Block = block s*
// p: Program = program b

type Value =
  | number
  | boolean
  | Value[]
  | ((...args: number[]) => Value)
  | [Identifier[], Expression];

let memory = new Map<string, Value>();

class Program {
  constructor(public block: Block) {}
  interpret(): void {
    return this.block.interpret();
  }
}

class Block {
  constructor(public statements: Statement[]) {}
  interpret(): void {
    for (let statement of this.statements) {
      statement.interpret();
    }
  }
}

interface Statement {
  interpret(): void;
}

class VariableDeclaration implements Statement {
  constructor(public id: Identifier, public expression: Expression) {}
  interpret(): void {
    if (memory.has(this.id.name)) {
      throw new Error(`Variable already declared`);
    }

    memory.set(this.id.name, this.expression.interpret());
  }
}

class FunctionDeclaration implements Statement {
  constructor(
    public id: Identifier,
    public parameters: Identifier[],
    public expression: Expression
  ) {}
  interpret(): void {
    if (memory.has(this.id.name)) {
      throw new Error(`Function already declared`);
    }

    memory.set(this.id.name, [this.parameters, this.expression]);
  }
}

class Assignment implements Statement {
  constructor(public id: Identifier, public expression: Expression) {}
  interpret(): void {
    if (!memory.has(this.id.name)) {
      throw new Error(`Variable not declared`);
    }

    memory.set(this.id.name, this.expression.interpret());
  }
}

class PrintStatement implements Statement {
  constructor(public expression: Expression) {}
  interpret(): void {
    console.log(this.expression.interpret());
  }
}

class WhileStatement implements Statement {
  constructor(public expression: Expression, public block: Block) {}
  interpret(): void {
    while (this.expression.interpret()) {
      this.block.interpret();
    }
  }
}

interface Expression {
  interpret(): Value;
}

class Numeral implements Expression {
  constructor(public value: number) {}
  interpret(): Value {
    return this.value;
  }
}

class BooleanLiteral implements Expression {
  constructor(public value: boolean) {}
  interpret(): Value {
    return this.value;
  }
}

class Identifier implements Expression {
  constructor(public name: string) {}
  interpret(): Value {
    if (!memory.has(this.name)) {
      throw new Error(`Variable ${this.name} not declared`);
    }
    return memory.get(this.name)!;
  }
}

class UnaryExpression implements Expression {
  constructor(public operator: string, public expression: Expression) {}
  interpret(): Value {
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

class BinaryExpression implements Expression {
  constructor(
    public operator: string,
    public left: Expression,
    public right: Expression
  ) {}
  interpret(): Value {
    const left = this.left.interpret() as number;
    const right = this.right.interpret() as number;
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

class CallExpression implements Expression {
  constructor(public id: Identifier, public args: Expression[]) {}
  interpret(): Value {
    const value = this.id.interpret();
    if (typeof value !== "function") {
      throw new Error(`Cannot call ${value} because it is not a function`);
    } else {
      const interpretedArgs = this.args.map((arg) => arg.interpret() as number);
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

class ConditionalExpression implements Expression {
  constructor(
    public test: Expression,
    public consequent: Expression,
    public alternate: Expression
  ) {}
  interpret(): Value {
    return this.test.interpret()
      ? this.consequent.interpret()
      : this.alternate.interpret();
  }
}

class ArrayLiteral implements Expression {
  constructor(public elements: Expression[]) {}
  interpret(): Value {
    return this.elements.map((element) => element.interpret());
  }
}

class SubscriptExpression implements Expression {
  constructor(public array: Expression, public index: Expression) {}

  interpret(): Value {
    const arrayValue = this.array.interpret();
    const indexValue = this.index.interpret();

    if (Array.isArray(arrayValue) && typeof indexValue === "number") {
      return arrayValue[indexValue] as Value;
    } else {
      throw new Error("SubscriptExpression: invalid expression");
    }
  }
}

// Sample Program to test interpreter
const sample: Program = new Program(
  new Block([
    new PrintStatement(new UnaryExpression("-", new Numeral(5))),
    new PrintStatement(
      new BinaryExpression("*", new Numeral(5), new Numeral(8))
    ),
    new PrintStatement(
      new ConditionalExpression(
        new BooleanLiteral(true),
        new Numeral(5),
        new Numeral(8)
      )
    ),
    new PrintStatement(
      new ArrayLiteral([new Numeral(1), new Numeral(2), new Numeral(3)])
    ),
    new PrintStatement(
      new SubscriptExpression(
        new ArrayLiteral([new Numeral(1), new Numeral(2), new Numeral(3)]),
        new Numeral(1)
      )
    ),
  ])
);

function interpret(p: Program) {
  return p.interpret();
}

interpret(sample);
