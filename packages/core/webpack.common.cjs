const path = require("path");

module.exports = (env) => {
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
          type: env.slim ? "asset/resource" : "asset/inline",
          ...(env.slim
            ? {
                generator: {
                  filename: "[name][ext]",
                },
              }
            : {}),
        },
      ],
    },
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "dist", env.slim ? "slim" : "default"),
      clean: true,
      globalObject: "this",
      library: {
        name: "prelude-core",
        type: "umd",
      },
    },
    resolve: {
      alias: {
        "#core": path.resolve(
          __dirname,
          "src",
          env.slim ? "core.slim.ts" : "core.default.ts"
        ),
      },
      extensions: [".tsx", ".ts", ".js"],
    },
  };
};
