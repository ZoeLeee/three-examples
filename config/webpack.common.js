const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ENTRY = require("./entry");
const JSRULE = require("./jsRule");

module.exports = {
  entry: ENTRY,
  module: {
    rules: [
      JSRULE,
      {
        test: /.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          'glslify-loader'
        ]
      }
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".css",'.tsx',".ts"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "../src/index.html"),
      filename: "./index.html",
    }),
  ],
  output: {
    filename: "[hash].bundle.js",
    path: path.resolve(__dirname, "../dist"),
  },
};
