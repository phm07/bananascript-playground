const syntax: any = {
    keywords: [
        "fn",
        "return",
        "let",
        "const",
        "if",
        "else",
        "for",
        "while",
        "type",
        "iface",
    ],
    typeKeywords: ["int", "float", "string", "bool"],
    constants: ["true", "false", "null", "void"],
    operators: [
        "==",
        "!=",
        "<",
        ">",
        "<=",
        ">=",
        "+",
        "-",
        "/",
        "*",
        "&&",
        "||",
        "=",
        "?",
        "&",
        "!",
        "++",
        "--",
        ".",
        ",",
        ";",
        ":",
        "::",
        ":=",
    ],
    symbols: /[=><!~?:&|+\-*/^%]+/,
    tokenizer: {
        root: [
            [
                /@?[a-zA-Z][\w$]*/,
                {
                    cases: {
                        "@keywords": "keyword",
                        "@typeKeywords": "type",
                        "@constants": "constant",
                        "@default": "identifier",
                    },
                },
            ],
            [/\/\/.+$/, "comment"],
            [/[;,.]/, "delimiter"],
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/\/\*/, "comment", "@comment"],
            [/\d+(?:\.\d*)?/, "number"],
            [/"(?:[^"\\]|\\.)*"/, "string"],
            [
                /@symbols/,
                {
                    cases: {
                        "@operators": "operator",
                        "@default": "",
                    },
                },
            ],
        ],
        comment: [
            [/\*\//, "comment", "@pop"],
            [/./, "comment"],
        ],
    },
};

export default syntax;
