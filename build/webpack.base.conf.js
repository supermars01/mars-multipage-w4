"use strict";
const path = require("path");
const utils = require("./utils");
const config = require("../config");
// const vueLoaderConfig = require("./vue-loader.conf");
var glob = require("glob");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin"); //开启自动webpack包缓存，默认存储在 /node_modules/下
const HappyPack = require("happypack"); //开启多线池
const os = require("os");
const happyThreadPool = HappyPack.ThreadPool({
  size: os.cpus().length
});
var entries = glob.sync("./src/pages/**/*.js").reduce(function(prev, curr) {
  prev[curr.slice(6, -3)] = curr;
  return prev;
}, {});

function resolve(dir) {
  return path.join(__dirname, "..", dir);
}
// entries.common = "./src/libs/common"; //引入全局js

module.exports = {
  entry: entries,
  output: {
    path: config.build.assetsRoot,
    filename: "[name].js",
    publicPath:
      process.env.NODE_ENV === "production"
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: [".js", ".vue", ".json", ".css"],
    alias: {
      vue$: "vue/dist/vue.esm.js",
      src: resolve("../src"),
      assets: resolve("../src/assets"),
      libs: resolve("../src/libs")
    }
  },
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: {
          loader: "html-loader-srcset",
          options: {
            attrs: [":data-src", ":data-srcset"] //处理data-src及data-srcset 资源
          }
        }
      },
      {
        test: /\.js$/,
        // loader: "babel-loader",
        include: [resolve("src"), resolve("test")],
        use: [
          {
            loader: "happypack/loader?id=js"
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loaders: [
          {
            loader: "url-loader",
            options: {
              limit: 100,
              publicPath:
                process.env.NODE_ENV === "production" //此处配置 生产环境 cdn路径
                  ? "http://192.168.1.100:5000/"
                  : "/",
              name: utils.assetsPath("images/[name].[hash:7].[ext]")
            }
          },
          {
            loader: "image-webpack-loader",
            query: {
              mozjpeg: {
                progressive: true
              },
              optipng: {
                optimizationLevel: 7
              },
              gifsicle: {
                interlaced: false
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4
              }
            }
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: utils.assetsPath("media/[name].[hash:7].[ext]")
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          // name: utils.assetsPath("fonts/[name].[hash:7].[ext]")
          name:
            process.env.NODE_ENV === "production"
              ? "/[name].[ext]"
              : utils.assetsPath("fonts/[name].[hash:7].[ext]")
        }
      }
    ]
  },
  plugins: [
    new HardSourceWebpackPlugin({
      // cacheDirectory是在高速缓存写入。默认情况下，将缓存存储在node_modules下的目录中，因此如
      // 果清除了node_modules，则缓存也是如此
      cacheDirectory: path.resolve(
        __dirname,
        "../node_modules/.cache/hard-source/[confighash]"
      ),
      // Either an absolute path or relative to webpack's options.context.
      // Sets webpack's recordsPath if not already set.
      configHash: function(webpackConfig) {
        return require("node-object-hash")({
          sort: false
        }).hash(webpackConfig);
      },
      recordsPath: path.resolve(
        __dirname,
        "../node_modules/.cache/hard-source/[confighash]/records.json"
      ),
      // configHash在启动webpack实例时转换webpack配置，并用于cacheDirectory为不同的webpack配
      // 置构建不同的缓存
      configHash: function(webpackConfig) {
        // node-object-hash on npm can be used to build this.
        return require("node-object-hash")({
          sort: false
        }).hash(webpackConfig);
      },
      // 当加载器，插件，其他构建时脚本或其他动态依赖项发生更改时，hard-source需要替换缓存以确保输
      // 出正确。environmentHash被用来确定这一点。如果散列与先前的构建不同，则将使用新的缓存
      environmentHash: {
        root: process.cwd(),
        directories: [],
        files: ["package-lock.json", "yarn.lock"]
      },
      info: {
        mode: "none",
        // 'debug', 'log', 'info', 'warn', or 'error'.
        level: "debug"
      },
      cachePrune: {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        sizeThreshold: 50 * 1024 * 1024
      }
    }),
    new HardSourceWebpackPlugin.ParallelModulePlugin({
      // How to launch the extra processes. Default:
      fork: (fork, compiler, webpackBin) =>
        fork(webpackBin(), ["--config", __filename], {
          silent: true
        }),
      // Number of workers to spawn. Default:
      numWorkers: () => require("os").cpus().length,
      // Number of modules built before launching parallel building. Default:
      minModules: 10
    }),
    //开启多线池
    new HappyPack({
      //用id来标识 happypack处理那里类文件
      id: "js",
      //如何处理  用法和loader 的配置一样
      loaders: [
        {
          loader: "babel-loader",
          cache: true,
          options: {
            presets: ["env"]
          }
        }
      ],
      //共享进程池
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: true
      //verboseWhenProfiling: Boolean 开启webpack --profile ,仍然希望HappyPack产生输出。
      //debug: Boolean 启用debug 用于故障排查。默认 false。
    })
  ]
};
