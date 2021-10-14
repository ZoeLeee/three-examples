const {merge} = require("webpack-merge");
const base = require("./webpack.common");

module.exports = merge(base, {
  mode: "development",
  devServer: {
    port: 3333,
    open: true,
  },
});
