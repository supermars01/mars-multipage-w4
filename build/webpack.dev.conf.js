"use strict";
const utils = require("./utils");
const path = require("path");
const webpack = require("webpack");
const config = require("../config");
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const PurgecssPlugin = require("purgecss-webpack-plugin"); //去除冗余css样式
const WebpackSpritesmithPlugin = require("webpack-spritesmith"); //生成icon雪碧图
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
// const VueLoaderPlugin = require("vue-loader/lib/plugin");
var glob = require("glob");
var htmls = glob.sync("./src/pages/**/*.html").map(function(item) {
  var names = item.split("/");

  return new HtmlWebpackPlugin({
    filename: "./" + names[2] + "/" + names[4], //相当于url
    template: "html-withimg-loader!" + item, //文件路径
    inject: true,
    hash: true,
    chunks: ["common", "manifest", "vendor", "libs", item.slice(6, -5)],
    chunksSortMode: "manual" // manual根据chunks的位置手动排序
  });
});
Object.keys(baseWebpackConfig.entry).forEach(function(name) {
  baseWebpackConfig.entry[name] = ["./build/dev-client"].concat(
    baseWebpackConfig.entry[name]
  );
});

module.exports = merge(baseWebpackConfig, {
  mode: "development",
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      usePostCSS: true
    })
  },
  devtool: "#cheap-module-eval-source-map",
  plugins: [
    // new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      // 编译时配置的全局变量
      "process.env": config.dev.env //当前环境为开发环境
    }),
    // 消除冗余的css代码
    // new PurgecssPlugin({
    //   paths: glob.sync("./src/pages/**/*", { nodir: true })
    // }),
    // new ExtractTextPlugin({
    //   filename: utils.assetsPath("css/[name].[hash].css"),
    //   allChunks: false
    // }),
    // 雪碧图插件
    new WebpackSpritesmithPlugin({
      // 目标小图标
      src: {
        // 小图标路径
        cwd: path.resolve(__dirname, "../src/assets/icon"),
        // 匹配小图标文件后缀名
        glob: "*.png"
      },
      target: {
        // 生成雪碧图(大图)文件存放路径
        image: path.resolve(__dirname, "../src/sprites/sprites.png"),
        // 对应的样式文件存放路径
        css: path.resolve(__dirname, "../src/sprites/sprites.css")
      },
      // 样式文件中,调用雪碧图的写法????
      apiOptions: {
        cssImageRef: "./sprites.png"
      },
      // 雪碧图生成算法
      spritesmithOptions: {
        algorithm: "top-down", // 从上到下生成方向.
        padding: 2 // 每个小图标之间的间隙
      },
      //自动适配视网膜二倍屏
      retina: "@2x"
    }),
    new webpack.HotModuleReplacementPlugin(), //热更新插件
    new webpack.NoEmitOnErrorsPlugin(), //不触发错误,即编译后运行的包正常运行
    new FriendlyErrorsPlugin() //友好的错误提示
  ].concat(htmls)
});
