import esbuild from "esbuild";
import buildOptions from "./buildOptions.mjs";

await esbuild.serve(
    {
        servedir: "public/",
        port: 3000
    },
    {
        ...buildOptions,
        outdir: undefined
    }
);

console.log("Server running on http://localhost:3000/");