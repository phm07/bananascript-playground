import { sassPlugin } from "esbuild-sass-plugin";

export default {
    entryPoints: ["src/index.tsx"],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: "es6",
    plugins: [sassPlugin({
        sourceMap: true
    })],
    outdir: "../dist/public"
};