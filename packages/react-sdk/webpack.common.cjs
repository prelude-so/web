const { merge } = require("webpack-merge");
const path = require("path");

const baseConfig = (slim) => {
  return {
    entry: "./src/index.ts",
    externals: {
      react: "react",
      "react/jsx-runtime": "react/jsx-runtime",
      "react-dom": "react-dom",
      "@prelude.so/js-sdk": slim ? "@prelude.so/js-sdk/slim" : "@prelude.so/js-sdk",
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
      filename: slim ? "index.slim.js" : "index.js",
      globalObject: "this",
      library: {
        name: "preludeReact",
        type: "umd",
      },
    },
    resolve: {
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
];
