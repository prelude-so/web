const { merge } = require("webpack-merge");
const path = require("path");

const baseConfig = (slim) => {
  return {
    entry: path.resolve(__dirname, "src/index.ts"),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.wasm$/,
          type: slim ? "asset/resource" : "asset/inline",
          ...(slim
            ? {
                generator: {
                  filename: "[name][ext]",
                },
              }
            : {}),
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: slim ? "index.slim.js" : "index.js",
      globalObject: "this",
      library: {
        name: "preludeCore",
        type: "umd",
      },
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
];
