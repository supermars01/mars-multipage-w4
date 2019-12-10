## vue多页
## 项目目录说明
```
### 多页面的目录结构如下：
|   |--- dist                               # 打包后生成的目录文件
|   |--- node_modules                       # 所有的依赖包
|   |--- src                                # 项目的文件包
|   |    |--- pages                         # 存放所有页面的文件
|   |    |    |--- page1
|   |    |    |    |--- index.html          # 第一个页面的html文件
|   |    |    |    |--- index.styl          # 第一个页面的css文件
|   |    |    |    |--- index.js            # 第一个页面的js文件
|   |    |    |--- page2
|   |    |    |    |--- index.html          # 第二个页面的html文件
|   |    |    |    |--- index.styl          # 第二个页面的css文件
|   |    |    |    |--- index.js            # 第二个页面的js文件
|   |    |--- libs                          # 没有npm的直接引用的插件
|   |--- build
|   |    |--- webpack.base.js               # webpack 基本配置文件
|   |    |--- webpack.dev.js                # 开发文件
|   |    |--- webpack.build.js              # 打包线上文件
|   |--- .gitignore
|   |--- README.md
|   |--- package.json                       # 配置项目相关信息，通过执行 npm init 命令创建
```


## 运行程序


启动发布代码

```
//初始化

npm install

//开发

npm run dev

//发布

npm run build

```

