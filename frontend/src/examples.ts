const helloWorld = `println("Hello, world!");`;

const loops = `let i := 0;

while i++ < 5 {
    let j := 0;
    let line := "";
    while j++ < i {
        line = line + "* ";
    }
    println(line);
}`;

const userInput = `let input := prompt("Enter password: ");
print("\\n");

if input == "123456" {
    println("Correct password!");
} else {
    println("Incorrect password!");
}`;

const functions = `// Prints first 10 factorials

fn fac(x: int) int {
    if x <= 1 {
        return 1;
    } else {
        return x * fac(x-1);
    }
}

let i := 0;
while i++ < 10 {
    println("fac(" + i + ")\t= " + fac(i));
}`;

const advancedFunctions = `fn newAdder() fn(int, int) int {
    fn adder(a: int, b: int) int {
        return a + b;
    }
    return adder;
}

let add := newAdder();
println(add(5, 5));`;

const examples = {
    "Hello, world!": helloWorld,
    Loops: loops,
    "User input": userInput,
    Functions: functions,
    "Advanced functions": advancedFunctions,
};

export default examples;
