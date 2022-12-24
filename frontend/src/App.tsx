import io from "socket.io-client";
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.scss";
import Editor, { useMonaco } from "@monaco-editor/react";
import {
    BsPlayFill,
    BsStopFill,
    BsChevronDown,
    BsInfoCircle,
} from "react-icons/bs";
import examples from "./examples";
import Converter from "ansi-to-html";

const ansiConverter = new Converter();

const socket = io(
    process.env.NODE_ENV === "development" ? "ws://localhost:3001" : "",
    {
        path: "/websocket/",
    }
);

function App() {
    const [code, setCode] = useState('println("Hello, world!");');
    const [output, setOutput] = useState("");
    const [input, setInput] = useState("");
    const [resizing, setResizing] = useState(false);
    const [height, setHeight] = useState(window.innerHeight / 2);
    const [running, setRunning] = useState(false);
    const [showExamples, setShowExamples] = useState(false);
    const [connected, setConnected] = useState(false);

    const navbarRef = useRef<HTMLDivElement>(null);
    const consoleRef = useRef<HTMLDivElement>(null);

    const start = useCallback(() => {
        setOutput("Running program...\n\n");
        socket.emit("run", code);
    }, [code]);

    const stop = useCallback(() => {
        socket.emit("stop");
    }, []);

    const submitInput = useCallback(() => {
        socket.emit("stdin", input);
        setInput("");
    }, [input]);

    const appendToConsole = useCallback(
        (data: string) => {
            setOutput(
                (output + data).split("\n").slice(-100).join("\n").slice(-20000)
            );
        },
        [output]
    );

    useEffect(() => {
        setInput("");
    }, [running]);

    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTo(0, consoleRef.current.scrollHeight);
        }
    }, [output, consoleRef]);

    useEffect(() => {
        const connectListener = () => {
            setConnected(true);
        };
        const disconnectListener = () => {
            setConnected(false);
        };
        const stdoutListener = (data: string) => {
            appendToConsole(data);
        };
        const runningListener = () => {
            setRunning(true);
        };
        const exitedListener = () => {
            setRunning(false);
        };
        socket.on("connect", connectListener);
        socket.on("disconnect", disconnectListener);
        socket.on("stdout", stdoutListener);
        socket.on("running", runningListener);
        socket.on("exited", exitedListener);
        return () => {
            socket.off("connect", connectListener);
            socket.off("disconnect", disconnectListener);
            socket.off("stdout", stdoutListener);
            socket.off("running", runningListener);
            socket.off("exited", exitedListener);
        };
    });

    useEffect(() => {
        const resizeListener = (e: MouseEvent) => {
            setHeight(
                Math.max(
                    200,
                    Math.min(
                        e.y - navbarRef.current!.offsetHeight,
                        window.innerHeight - 300
                    )
                )
            );
        };
        if (resizing) {
            window.addEventListener("mousemove", resizeListener);
        }
        const mouseUpListener = () => {
            setResizing(false);
        };
        window.addEventListener("mouseup", mouseUpListener);
        return () => {
            window.removeEventListener("mousemove", resizeListener);
            window.removeEventListener("mouseup", mouseUpListener);
        };
    }, [resizing]);

    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            monaco.languages.register({
                id: "bananascript",
            });
            monaco.languages.setMonarchTokensProvider("bananascript", {
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
                typeKeywords: ["int", "string", "bool"],
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
                        [/\d+/, "number"],
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
            });
        }
    }, [monaco]);

    return (
        <div className="main-container">
            <div className="title-section" ref={navbarRef}>
                <h1>BananaScript Playground</h1>
                <div className="examples">
                    <button
                        onClick={() => setShowExamples(true)}
                        onBlur={() => setShowExamples(false)}
                    >
                        Examples <BsChevronDown />
                    </button>
                    {showExamples ? (
                        <ul className="examples-list">
                            {Object.entries(examples).map(([name, content]) => (
                                <li
                                    key={name}
                                    onMouseDown={() => setCode(content)}
                                >
                                    {name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <></>
                    )}
                </div>
            </div>

            <Editor
                onChange={(code) => setCode(code ?? "")}
                value={code}
                height={height}
                defaultLanguage="bananascript"
                theme="vs-dark"
                options={{ fontSize: 16 }}
            />

            <div
                className="drag-area"
                onMouseDown={(e) => {
                    e.preventDefault();
                    setResizing(true);
                }}
            />
            <div className="title-section" ref={navbarRef}>
                <h1>Console</h1>
                <button
                    disabled={!connected}
                    style={{ color: running ? "#ff6666" : "#78ff2c" }}
                    onClick={running ? stop : start}
                >
                    {running ? <BsStopFill /> : <BsPlayFill />}
                </button>
                <div className="info">
                    <BsInfoCircle />
                    <div className="info-content">
                        Limits:
                        <ul>
                            <li>128MB Ram</li>
                            <li>0.25 V-CPU cores</li>
                            <li>60s execution time</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div
                className="console-area"
                ref={consoleRef}
                dangerouslySetInnerHTML={{
                    __html: ansiConverter.toHtml(output),
                }}
            />
            <input
                disabled={!running}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? submitInput() : null)}
                className="console-input"
                type="text"
                spellCheck={false}
                placeholder={"Console input..."}
            />
        </div>
    );
}

export default App;
