require("@babel/register")({
    extensions: [".ts", ".js", ".jsx"],
    presets: [
        "@babel/preset-env",
        ["@babel/preset-react", { runtime: "automatic" }],
        ["@babel/preset-typescript", { onlyRemoveTypeImports: true }]
    ]
});

const cfg = require("./webpack.config.ts");
module.exports = cfg.default || cfg;
