"use strict";
const path = require("path");
const utils = require("./utils");
const webpack = require("webpack");
const config = require("../config");
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const PurgecssPlugin = require("purgecss-webpack-plugin"); //去除冗余css样式
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
let BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
// const VueLoaderPlugin = require("vue-loader/lib/plugin");
const env = config.build.env;

var glob = require("glob");
var htmls = glob.sync("./src/pages/**/*.html").map(function(item) {
  var newItem = item.slice(12);
  var i = newItem.indexOf("/");
  var genName = newItem.substring(i);
  // new CleanWebpackPlugin(["dist"]);
  return new HtmlWebpackPlugin({
    filename: "." + genName,
    template: "html-withimg-loader!" + item,
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
    },
    hash: true,
    chunks: ["common", "vendors", "runtime", "libs", item.slice(6, -5)],
    chunksSortMode: "manual"
  });
});
const webpackConfig = merge(baseWebpackConfig, {
  mode: "production",
  optimization: {
    runtimeChunk: "single", // 等价于
    // runtimeChunk: {
    //   name: 'runtime'
    // }
    // 分割代码块
    splitChunks: {
      chunks: "async",
      // 大于30KB才单独分离成chunk
      minSize: 30000,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true,
      cacheGroups: {
        //公用模块抽离
        common: {
          name: "common",
          chunks: "initial",
          minSize: 0, //大于0个字节
          minChunks: 2 //抽离公共代码时，这个代码块最小被引用的次数
        },
        default: {
          priority: -20,
          reuseExistingChunk: true
        },
        vendors: {
          name: "vendors",
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: "all",
          minChunks: 2
        }
      }
    },
    minimizer: [
      new UglifyJsPlugin({
        exclude: /\.min\.js$/, // 过滤掉以".min.js"结尾的文件，我们认为这个后缀本身就是已经压缩好的代码，没必要进行二次压缩
        cache: true,
        parallel: true, // 开启并行压缩，充分利用cpu
        sourceMap: false,
        extractComments: false, // 移除注释
        uglifyOptions: {
          compress: {
            unused: true,
            drop_debugger: true
          },
          output: {
            comments: false
          }
        }
      })
    ]
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? "#source-map" : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath("js/[name].[hash].js"),
    chunkFilename: utils.assetsPath("js/[name].[hash].js")
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      "process.env": env
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: false
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }),
    new ExtractTextPlugin({
      filename: utils.assetsPath("css/[name].[hash].css"),
      allChunks: true
    }),
    // 消除冗余的css代码
    // new PurgecssPlugin({
    //   paths: glob.sync("./src/pages/**/*", { nodir: true })
    // }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    new webpack.HashedModuleIdsPlugin(),
    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, "../static"),
    //     to: config.build.assetsSubDirectory,
    //     ignore: [".*"]
    //   }
    // ]),
    new BundleAnalyzerPlugin({
      //  可以是`server`，`static`或`disabled`。
      //  在`server`模式下，分析器将启动HTTP服务器来显示软件包报告。
      //  在“静态”模式下，会生成带有报告的单个HTML文件。
      //  在`disabled`模式下，你可以使用这个插件来将`generateStatsFile`设置为`true`来生成Webpack Stats JSON文件。
      analyzerMode: "server",
      //  将在“服务器”模式下使用的主机启动HTTP服务器。
      analyzerHost: "127.0.0.1",
      //  将在“服务器”模式下使用的端口启动HTTP服务器。
      analyzerPort: 8888,
      //  路径捆绑，将在`static`模式下生成的报告文件。
      //  相对于捆绑输出目录。
      reportFilename: "report.html",
      //  模块大小默认显示在报告中。
      //  应该是`stat`，`parsed`或者`gzip`中的一个。
      //  有关更多信息，请参见“定义”一节。
      defaultSizes: "parsed",
      //  在默认浏览器中自动打开报告
      openAnalyzer: true,
      //  如果为true，则Webpack Stats JSON文件将在bundle输出目录中生成
      generateStatsFile: false,
      //  如果`generateStatsFile`为`true`，将会生成Webpack Stats JSON文件的名字。
      //  相对于捆绑输出目录。
      statsFilename: "stats.json",
      //  stats.toJson（）方法的选项。
      //  例如，您可以使用`source：false`选项排除统计文件中模块的来源。
      //  在这里查看更多选项：https：  //github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
      statsOptions: null,
      logLevel: "info" //日志级别。可以是'信息'，'警告'，'错误'或'沉默'。
    })
  ].concat(htmls)
});

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require("compression-webpack-plugin");

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: new RegExp(
        "\\.(" + config.build.productionGzipExtensions.join("|") + ")$"
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  );
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
