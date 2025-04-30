const path = require("path");

module.exports = (env) => {
  return {
    entry: "./src/index.ts",
    externals: {
      react: "react",
      "react/jsx-runtime": "react/jsx-runtime",
      "react-dom": "react-dom",
      "@prelude.so/js-sdk": env.slim ? "@prelude.so/js-sdk/slim" : "@prelude.so/js-sdk",
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
      filename: "index.js",
      path: path.resolve(__dirname, "dist", env.slim ? "slim" : "default"),
      clean: true,
      globalObject: "this",
      library: {
        name: "prelude-react",
        type: "umd",
      },
    },
    resolve: {
      alias: {
        "@prelude.so/js-sdk": env.slim ? "@prelude.so/js-sdk/slim" : "@prelude.so/js-sdk",
      },
      extensions: [".tsx", ".ts", ".js"],
    },
  };
};
