import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import { BuildOptions } from "./types/config";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

export function buildPlugins({
    paths,
    isDev,
}: BuildOptions): webpack.WebpackPluginInstance[] {
    const plugins = [
        new HtmlWebpackPlugin({
            template: paths.html,
            favicon: "./public/favicon.svg",
        }),
        new webpack.ProgressPlugin(),
        new MiniCssExtractPlugin({
            filename: "css/[name].[contenthash:8].css",
            chunkFilename: "css/[name].[contenthash:8].css",
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "../node_modules/web-ifc/web-ifc.wasm"),
                    to: "ifc/web-ifc.wasm",
                },
                {
                    from: path.resolve(__dirname, "../node_modules/web-ifc/web-ifc-mt.wasm"),
                    to: "ifc/web-ifc-mt.wasm",
                },
            ],
        }),
    ];

    if (isDev) {
        plugins.push(
            new webpack.HotModuleReplacementPlugin()
            // new BundleAnalyzerPlugin({
            //     openAnalyzer: false
            // })
        );
    }

    return plugins;
}
