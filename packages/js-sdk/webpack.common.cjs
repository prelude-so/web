const path = require("path");

module.exports = (env) => {
  return {
    externals: {
      "browser-tabs-lock": "browser-tabs-lock",
      "@prelude.so/core": "@prelude.so/core",
      "@prelude.so/core/slim": "@prelude.so/core/slim",
      "@prelude.so/core/slim/index_bg.wasm": "@prelude.so/core/slim/index_bg.wasm",
    },
    entry: {
      signals: path.resolve(__dirname, "src/signals/index.ts"),
      session: path.resolve(__dirname, "src/session/index.ts"),
      main: path.resolve(__dirname, "src/index.ts"),
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.wasm$/,
          type: env.slim ? "asset/resource" : "asset/inline",
        },
      ],
    },
    output: {
      filename: "[name]/index.js",
      path: path.resolve(__dirname, "dist", env.slim ? "slim" : "default"),
      clean: true,
      globalObject: "this",
      library: {
        name: "prelude-js",
        type: "umd",
      },
    },
    resolve: {
      alias: {
        "#core": path.resolve(__dirname, "src", env.slim ? "core.slim.ts" : "core.default.ts"),
      },
      extensions: [".tsx", ".ts", ".js"],
    },
  };
};
