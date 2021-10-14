const path = require("path");

module.exports = {
  test: /\.tsx?$/,
  exclude: /node_modules/,
  include: path.resolve(__dirname, "../src"),
  use: {
    loader: "babel-loader",
  },
};
