const { merge } = require("webpack-merge");
const common = require("./webpack.common.cjs");

module.exports = (env) => {
  return merge(common(env), {
    devtool: "inline-source-map",
    mode: "development",
  });
};
