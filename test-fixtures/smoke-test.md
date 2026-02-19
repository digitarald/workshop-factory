# Intro to TypeScript
**Topic:** typescript-basics
**Audience:** beginner (TypeScript/Node.js)
**Duration:** 60 minutes

**Prerequisites:**
- Basic JavaScript knowledge

---

## Table of Contents
1. **Getting Started with TypeScript** (30 min)
   1.1. What is TypeScript? (5 min)
   1.2. Your First TypeScript File (15 min)
   1.3. Type Basics Check (5 min)
   1.4. When to Use TypeScript (5 min)
2. **Functions and Interfaces** (30 min)
   2.1. Typing Functions (5 min)
   2.2. Build a Typed Utility (15 min)
   2.3. Functions & Interfaces Check (5 min)
   2.4. Wrap Up (5 min)

---

## 1. Getting Started with TypeScript

**Learning Objectives:**
- Set up a TypeScript project (apply)
- Understand type annotations (understand)

**Duration:** 30 minutes

### 1.1. What is TypeScript?

**Duration:** 5 minutes

**Talking Points:**
- TypeScript is a superset of JavaScript — every valid JS file is already valid TS
- The type system acts as a safety net, catching bugs before your code ever runs
- TypeScript compiles (transpiles) down to standard JavaScript that runs anywhere JS does
- Major frameworks like Angular, Next.js, and Deno use TypeScript by default

### 1.2. Your First TypeScript File

**Duration:** 15 minutes

Initialize a new TypeScript project with `npm init -y && npm install typescript --save-dev && npx tsc --init`. Then create a file called `greeter.ts` that declares variables with explicit type annotations for a person's name, age, and a list of hobbies. Finally, write a function `introduce` that accepts those values and returns a formatted greeting string. Compile with `npx tsc` and run the output with `node greeter.js`.

#### Starter Code

```
// greeter.ts
// TODO: Annotate each variable with its type
let name = "Alice"
let age = 30
let hobbies = ["reading", "hiking"]

// TODO: Add parameter types and a return type
function introduce(name, age, hobbies) {
  return `Hi, I'm ${name}, ${age} years old. I enjoy ${hobbies.join(", ")}.`
}

console.log(introduce(name, age, hobbies))

```

#### Solution

<details>
<summary>Click to reveal solution</summary>

```
// greeter.ts
let name: string = "Alice"
let age: number = 30
let hobbies: string[] = ["reading", "hiking"]

function introduce(name: string, age: number, hobbies: string[]): string {
  return `Hi, I'm ${name}, ${age} years old. I enjoy ${hobbies.join(", ")}.`
}

console.log(introduce(name, age, hobbies))

```

</details>

#### Hints

<details>
<summary>Click to reveal hints</summary>

1. Primitive types use lowercase keywords: string, number, boolean
2. Arrays can be typed as string[] or Array<string>
3. A function's return type is placed after the parameter list: function foo(): string { ... }

</details>

### 1.3. Type Basics Check

**Duration:** 5 minutes

**Questions:**
1. What file does `npx tsc --init` create, and what is its purpose?
2. If you declare `let score: number = 100` and later write `score = "high"`, what happens?

#### Answers

<details>
<summary>Click to reveal answers</summary>

1. **Answer:** It creates tsconfig.json, which configures the TypeScript compiler options for the project.
   **Explanation:** tsconfig.json controls settings like target JS version, module system, strict mode, and which files to compile.
2. **Answer:** The TypeScript compiler raises a type error because a string cannot be assigned to a variable typed as number.
   **Explanation:** Static type checking enforces that values match their declared types at compile time, preventing entire categories of runtime bugs.

</details>

### 1.4. When to Use TypeScript

**Duration:** 5 minutes

**Prompts:**
1. Think of a bug you've encountered in JavaScript that would have been caught by a type checker. What was the root cause?
2. In what scenarios might starting with plain JavaScript and migrating later make more sense than using TypeScript from day one?

## 2. Functions and Interfaces

**Learning Objectives:**
- Define typed functions (apply)
- Create and use interfaces (apply)

**Duration:** 30 minutes

### 2.1. Typing Functions

**Duration:** 5 minutes

**Talking Points:**
- Every function parameter should have a type annotation; TypeScript does not infer parameter types from usage
- Return types can be inferred but adding them explicitly serves as documentation and catches accidental changes
- Optional parameters use the `?` suffix and must come after required parameters: `function greet(name: string, title?: string)`
- Default parameter values let TypeScript infer the type automatically: `function delay(ms = 1000)` infers `number`
- Interfaces can describe function shapes using call signatures: `interface Formatter { (input: string): string }`

### 2.2. Build a Typed Utility

**Duration:** 15 minutes

Create a module called `mathUtils.ts` that exports three typed functions: (1) `clamp(value, min, max)` — returns the value constrained between min and max, (2) `average(...nums)` — accepts a rest parameter of numbers and returns their average, and (3) define an interface `Range` with properties `min: number` and `max: number`, then write `isInRange(value, range)` that returns whether the value falls within the given Range. Export all functions and the interface.

#### Starter Code

```
// mathUtils.ts

// TODO: Define a Range interface

// TODO: Add types to all parameters and return values
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function average(...nums) {
  const sum = nums.reduce((a, b) => a + b, 0)
  return sum / nums.length
}

function isInRange(value, range) {
  return value >= range.min && value <= range.max
}

export { clamp, average, isInRange }

```

#### Solution

<details>
<summary>Click to reveal solution</summary>

```
// mathUtils.ts

export interface Range {
  min: number
  max: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function average(...nums: number[]): number {
  const sum = nums.reduce((a, b) => a + b, 0)
  return sum / nums.length
}

export function isInRange(value: number, range: Range): boolean {
  return value >= range.min && value <= range.max
}

```

</details>

#### Hints

<details>
<summary>Click to reveal hints</summary>

1. Rest parameters are typed as arrays: `...items: number[]`
2. An interface groups related properties: `interface Range { min: number; max: number }`
3. Use the interface name as a parameter type just like a primitive: `range: Range`

</details>

### 2.3. Functions & Interfaces Check

**Duration:** 5 minutes

**Questions:**
1. What is the difference between an optional parameter (`name?: string`) and a parameter with a default value (`name = "World"`)?
2. Can an interface extend another interface? Give a one-line example.

#### Answers

<details>
<summary>Click to reveal answers</summary>

1. **Answer:** An optional parameter may be undefined and has no fallback, while a default-value parameter automatically uses the specified value when omitted.
   **Explanation:** Optional parameters require you to handle `undefined` in the function body, whereas defaults guarantee a usable value — choose based on whether a sensible fallback exists.
2. **Answer:** Yes. Example: `interface Square extends Shape { sideLength: number }`
   **Explanation:** Interface extension is one of TypeScript's key composition tools; the child interface inherits all parent properties and can add new ones, enabling incremental type modeling.

</details>

### 2.4. Wrap Up

**Duration:** 5 minutes

**Prompts:**
1. How would you decide whether to use an interface or a type alias when modeling data in a new project?
2. What is one thing you plan to refactor or build differently now that you know how to type functions and interfaces?

---

*Generated by Workshop Factory on 2026-02-19T00:05:10.807Z*
