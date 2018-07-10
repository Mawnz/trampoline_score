'use strict';
// http://blog.teamtreehouse.com/bundling-angular-with-webpack
// https://medium.com/@var_bin/angularjs-webpack-lazyload-bb7977f390dd
// https://medium.com/@narthur157/how-to-modernized-angularjs-1-5-with-es6-webpack-mocha-sass-and-components-1babb45a0381
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // Context - The absolute path for our source files
  context: __dirname + '/src/',
  // Entry - The main file for our app
  entry: {
    app: './index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      // The HTML loader
      {
        test: /\.html$/,
        use: [{ loader: "html-loader", options: { minimize: true } }]
      },
      // The Image loader
      {
        test: /\.(png|jpe?g)/i,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "./assets/images/[name].[ext]",
              limit: 10000
            }
          },
          {
            loader: "img-loader"
          }
        ]
      },
      // The SASS loader, https://github.com/webpack-contrib/sass-loader
      {
        test: /\.scss$/,
        use: [
            // fallback to style-loader in development
            process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader"
        ]
      },
      // The CSS loader
      {
        test: /\.css$/,
        use: [
          // fallback to style-loader in development
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./index.html",
      filename: "./index.html"
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ]
};