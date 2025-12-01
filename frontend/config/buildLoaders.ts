import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";
import { BuildOptions } from "./types/config";

export function buildLoaders({ isDev }: BuildOptions): webpack.RuleSetRule[] {
    const cssLoader = {
        test: /\.css$/i,
        use: [
            isDev ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
        ],
    };

    const fileLoader = {
        test: /\.(png|jpe?g|gif|woff2|woff)$/i,
        use: ["file-loader"],
    };

    const pdfLoader = {
        test: /\.pdf$/i,
        use: [
            {
                loader: "file-loader",
                options: {
                    name: "static/docs/[name].[contenthash].[ext]", // например: static/docs/policy.a1b2c3.pdf
                },
            },
        ],
    };

    const jsxLoader = {
        test: /\.(js|jsx|tsx)$/,
        exclude: /node_modules/,
        use: {
            loader: "babel-loader",
            options: {
                presets: ["@babel/preset-env"],
            },
        },
    };

    const typescriptLoader = {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
    };

    const svgLoader = {
        test: /\.svg$/,
        use: [
            {
                loader: "@svgr/webpack",
                options: {
                    // Additional options can be configured here
                },
            },
            "url-loader",
        ],
    };
    return [
        fileLoader,
        pdfLoader,
        svgLoader,
        jsxLoader,
        typescriptLoader,
        cssLoader,
    ];
}
