import path from "path";
import webpack from "webpack";
import { buildWebpackConfig } from "./config/buildWebpackConfig";
import type { BuildEnv, BuildPaths } from "./config/types/config";

export default (env: BuildEnv = {} as BuildEnv) => {
    const paths: BuildPaths = {
        entry: path.resolve(__dirname, "src", "index.jsx"),
        build: path.resolve(__dirname, "build"),
        html: path.resolve(__dirname, "public", "index.html"),
        src: path.resolve(__dirname, "src")
    };

    const mode = env.mode || "development";
    const isDev = mode === "development";
    const PORT = env.port || 3000;
    const HOST = env.host || "0.0.0.0";

    const config: webpack.Configuration = buildWebpackConfig({
        mode,
        paths,
        isDev,
        port: PORT,
        host: HOST
    });

    config.resolve = {
        ...(config.resolve || {}),
        fullySpecified: false,
        extensions: Array.from(
            new Set([...(config.resolve?.extensions || []), ".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"])
        ),
        alias: {
            ...(config.resolve?.alias || {}),
            three: path.resolve(__dirname, "node_modules/three")
        }
    };

    config.module = config.module || { rules: [] };
    config.module.rules = [
        ...(config.module.rules || []),
        {
            test: /\.m?js$/,
            resolve: { fullySpecified: false }
        }
    ];

    config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        (warning: any) =>
            /node_modules\/web-ifc\/web-ifc-api\.js$/.test(warning?.module?.resource || "") &&
            /Critical dependency/.test(String(warning?.message || "")),
        (warning: any) =>
            /node_modules\/web-ifc-three\//.test(warning?.module?.resource || "") &&
            /Critical dependency/.test(String(warning?.message || ""))
    ];

    config.optimization = {
        ...(config.optimization || {}),
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    priority: 10,
                    reuseExistingChunk: true,
                },
                ifc: {
                    test: /[\\/]node_modules[\\/](web-ifc|web-ifc-viewer|web-ifc-three|three)[\\/]/,
                    name: "ifc-libs",
                    priority: 20,
                    reuseExistingChunk: true,
                },
            },
            ...(config.optimization as any)?.splitChunks
        },
        runtimeChunk: (config.optimization as any)?.runtimeChunk || "single"
    };

    config.performance = {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    };

    return config;
};
