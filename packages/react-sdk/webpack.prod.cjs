const { merge } = require("webpack-merge");
const common = require("./webpack.common.cjs");

module.exports = common.map((config) =>
  merge(config, {
    mode: "production",
  }),
);
