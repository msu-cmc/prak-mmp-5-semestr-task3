import { BuildOptions } from "./types/config";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import path from "path";

export function buildDevServer(options: BuildOptions): DevServerConfiguration {
    return {
        port: options.port,
        open: true,
        historyApiFallback: true,
        hot: true,
        host: options.host,
        static: [
            {
                directory: path.resolve(__dirname, "../public"),
                publicPath: "/",
            },
        ],
    };
}
