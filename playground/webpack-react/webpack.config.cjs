const path = require("path");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

module.exports = function (env, { mode }) {
  return {
    mode,
    devtool: mode === "development" ? "inline-source-map" : undefined,
    entry: "./src/App.tsx",
    target: "web",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        // If you're using a `/slim` entrypoint, then you'll have to copy the `.wasm` core as a static asset in your bundle.
        {
          test: /\.wasm$/,
          include: [path.resolve(__dirname, "node_modules/@prelude.so/core")],
          type: "asset/resource",
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
      minimize: mode === "production",
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new Dotenv({
        path: "./.env.local",
      }),
      new HtmlWebpackPlugin({ template: "./src/index.html" }),
    ],
    output: {
      iife: true,
      clean: true,
      filename: "App.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },
    devServer: {
      static: "./dist",
      devMiddleware: {
        index: true,
        publicPath: "/dist",
        writeToDisk: true,
      },
    },
  };
};
