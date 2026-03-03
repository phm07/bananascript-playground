/// <reference types="vite-plugin-svgr/client" />

interface BananaRunResult {
    output: string;
    errors: { message: string; line: number; col: number }[];
}

declare class Go {
    importObject: WebAssembly.Imports;
    run(instance: WebAssembly.Instance): Promise<void>;
}

declare function bananaRun(code: string): BananaRunResult;
