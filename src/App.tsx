import { useCallback, useEffect, useRef, useState } from "react";
import "./App.scss";
import Editor, { useMonaco } from "@monaco-editor/react";
import { BsPlayFill, BsChevronDown } from "react-icons/bs";
import examples from "./examples";
import Converter from "ansi-to-html";
import languageSyntax from "./syntax";
import { ReactComponent as GithubLogo } from "./github-mark-white.svg";

const ansiConverter = new Converter();

function App() {
    const [code, setCode] = useState('println("Hello, world!");');
    const [output, setOutput] = useState("");
    const [resizing, setResizing] = useState(false);
    const [height, setHeight] = useState(window.innerHeight / 2);
    const [running, setRunning] = useState(false);
    const [showExamples, setShowExamples] = useState(false);
    const [wasmReady, setWasmReady] = useState(false);

    const navbarRef = useRef<HTMLDivElement>(null);
    const consoleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const go = new Go();
        WebAssembly.instantiateStreaming(
            fetch("/bananascript.wasm"),
            go.importObject
        ).then((result) => {
            go.run(result.instance);
            setWasmReady(true);
        });
    }, []);

    const start = useCallback(() => {
        setOutput("Running program...\n\n");
        setRunning(true);
        // Yield to let React flush the above state updates before blocking the thread
        setTimeout(() => {
            const result = bananaRun(code);
            let out = result.output;
            if (result.errors.length > 0) {
                out += result.errors
                    .map((e) => `[error] line ${e.line}: ${e.message}`)
                    .join("\n");
            }
            setOutput(out.split("\n").slice(-100).join("\n").slice(-20000));
            setRunning(false);
        }, 0);
    }, [code]);

    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTo(0, consoleRef.current.scrollHeight);
        }
    }, [output, consoleRef]);

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
            monaco.languages.setMonarchTokensProvider(
                "bananascript",
                languageSyntax
            );
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

                <a
                    href="https://github.com/pauhull/bananascript"
                    target="_blank"
                    className="github-link"
                >
                    <GithubLogo viewBox="0 0 98 96" />
                </a>
            </div>

            <Editor
                onChange={(value) => setCode(value ?? "")}
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
            <div className="title-section">
                <h1>Console</h1>
                <button
                    disabled={!wasmReady || running}
                    style={{ color: "#78ff2c" }}
                    onClick={start}
                >
                    <BsPlayFill />
                </button>
            </div>

            <div
                className="console-area"
                ref={consoleRef}
                dangerouslySetInnerHTML={{
                    __html: ansiConverter.toHtml(output),
                }}
            />
        </div>
    );
}

export default App;
