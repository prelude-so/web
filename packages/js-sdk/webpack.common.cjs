const { merge } = require("webpack-merge");
const path = require("path");

const baseConfig = (slim) => {
  return {
    entry: {
      signals: path.resolve(__dirname, "src/signals/index.ts"),
      session: path.resolve(__dirname, "src/session/index.ts"),
      main: path.resolve(__dirname, "src/index.ts"),
    },
    externals: {
      "browser-tabs-lock": "browser-tabs-lock",
      "@prelude.so/core": "@prelude.so/core",
      "@prelude.so/core/slim": "@prelude.so/core/slim",
      "@prelude.so/core/index_bg.wasm": "@prelude.so/core/index_bg.wasm",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: slim ? "[name]/index.slim.js" : "[name]/index.js",
      globalObject: "this",
      library: {
        type: "umd",
        name: "prelude",
      },
    },
    resolve: {
      alias: {
        "#core": path.resolve(__dirname, "src", slim ? "core.slim.ts" : "core.default.ts"),
      },
      extensions: [".tsx", ".ts", ".js"],
    },
  };
};

module.exports = [
  merge(baseConfig(false), {
    name: "default",
  }),
  merge(baseConfig(true), {
    name: "slim",
  }),
  merge(baseConfig(false), {
    name: "umd",
    externals: {
      "@prelude.so/core": "preludeCore",
    },
    output: {
      path: path.resolve(__dirname, "dist/umd"),
    },
  }),
];
