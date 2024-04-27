// https://www.cnblogs.com/cckui/p/10913040.html

// 一、导入各类开发依赖包
// 导入gulp开发依赖包
const gulp = require('gulp');

/*
    1. css压缩
    $ npm i -D gulp-cssmin
*/
const cssmin = require('gulp-cssmin');

/*
    2. css添加前缀 (降级，高版本只支持 import 语法)
    $ npm i -D gulp-autoprefixer@^6.1.0
*/
const autoprefixer = require('gulp-autoprefixer');

/*
    3. sass 转换css  需要依赖node-sass
    如果下载失败，先下载node-sass
    1. $ set SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass/
    2. $ npm i -D sass
       $ npm i -D gulp-sass
 */

const sass = require('gulp-sass')(require('sass'));

/*
    4. js压缩   gulp-uglify
    $ npm i -D gulp-uglify
 */
const uglify = require('gulp-uglify');

/*
    5. js es6转es5  gulp-babel
    依赖两个包:
    $  npm i -D @babel/core
    $  npm i -D babel-preset-es2015
    $  npm i -D gulp-babel
 */
const babel = require('gulp-babel');

/**
    6. html 压缩 gulp-htmlmin
    $ npm i -D gulp-htmlmin
 */
const htmlmin = require('gulp-htmlmin');

/*
    7. 图片压缩（无损压缩） gulp-imagemin 压缩程度最高7级 (降级，高版本只支持 import 语法)
    $ npm i -D gulp-imagemin@^5.0.3
 */
const imagemin = require('gulp-imagemin');

/*
    8. 删除 del (降级，高版本只支持 import 语法)
    $ npm i -D del@^4.1.1 
 */
const del = require('del');

/*
    9. gulp-webserver
    启动一个基于node书写的服务器
    npm i -D gulp-webserver
    导入之后得到一个处理流文件的函数，再管道函数内调用就可以了，需要传递参数
 */
const webserver = require('gulp-webserver');

/*
    10. gulp-file-include
    作用： 在一个HTML页面导入一个html片段
    下载： npm i -D gulp-file-include
 */
const fileInclude = require('gulp-file-include');

/**
    11. gulp-rev
 */
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');

// gulp@4 写法
// css打包任务
const cssHandler = function cssHandler() {
  return gulp
    .src('./src/css/*.css') // 找到内容
    .pipe(autoprefixer()) // 自动添加前缀
    .pipe(cssmin()) // 压缩
    .pipe(rev()) // 添加版本号
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/css/')) // 放到指定目录
    .pipe(rev.manifest())
    .pipe(gulp.dest('./rev'));
};
// sass打包任务
const sassHandler = function sassHandler() {
  return gulp
    .src('./src/sass/*.scss') // 找到内容
    .pipe(sass()) // 转换成css
    .pipe(autoprefixer()) // 自动添加前缀
    .pipe(cssmin()) // 压缩
    .pipe(rev()) // 添加版本号
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/sass/')) // 放到指定目录
    .pipe(rev.manifest())
    .pipe(gulp.dest('./rev'));
};

// 打包js文件的任务
const jsHandler = function jsHandler() {
  return gulp
    .src('./src/js/*.js') // 找到js文件
    .pipe(
      babel({
        presets: ['es2015'],
      })
    ) // es6转换es5
    .pipe(uglify()) // 压缩
    .pipe(rev()) // 添加版本号
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/js/')) // 放到指定目录
    .pipe(rev.manifest())
    .pipe(gulp.dest('./rev'));
};

// 打包images文件的任务
const imgHandler = function () {
  return gulp
    .src('./src/images/**/*')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('./dist/images/'));
};

// 打包html任务
const htmlHandler = function () {
  return gulp
    .src(['./rev/*.json', './src/**/*.html'])
    .pipe(
      fileInclude({
        // 根据配置导入对应的html片段
        prefix: '@-@', // 自定义标识符
        basepath: './src/components', // 基准目录，组件文件都在哪一个目录里面
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true, // 移除空格
        removeEmptyAttributes: true, // 移除空属性（仅限原生）
        collapseBooleanAttributes: true, // 移除 checked 类似的布尔值
        removeAttributeQuotes: true, // 移除属性上的双引号
        minifyCSS: true, // 压缩内嵌css代码（基本压缩，不能自动添加前缀）
        minifyJS: true, // 压缩内嵌js代码（基本压缩，不能转码）
        removeStyleLinkTypeAttributes: true, // 移除 style 和 link 上的 type 属性
        removeScriptTypeAttributes: true, // 移除 script 上的 type 属性
      })
    )
    .pipe(gulp.dest('./dist/'))
    .pipe(revCollector({ replaceReved: true }))
};

// 默认先删除dist文件夹
const delHandler = function () {
  return del(['./dist/', './rev/']);
};

// 配置启动服务器任务
// 利用gulp启动一个服务器
// gulp是基于node环境的工具
// node就是可以做服务器的语言
// gulp可以启动一个基于node的服务器
// 用dist目录当做服务器根目录

const webHandler = function () {
  return gulp.src('./dist').pipe(
    webserver({
      host: 'localhost', // 域名(可以配置自定义域名)
      port: '8080', // 端口号
      livereload: true, // 当文件修改的时候是否刷新页面
      open: './index.html', // 默认打开哪一个文件（从dist 目录以后的目录开始书写）
    })
  );
};

// 创建一个监控任务
const watchHandler = function () {
  //使用 gulp.watch
  gulp.watch('./src/css/*.css', cssHandler);
  gulp.watch('./src/sass/*.scss', sassHandler);
  gulp.watch('./src/js/*.js', jsHandler);
  gulp.watch('./src/images/*.html', imgHandler);
  gulp.watch('./src/**/*.html', htmlHandler);
};

module.exports = {
  server: webHandler,
  cssHandler: cssHandler,
  sassHandler: sassHandler,
  jsHandler: jsHandler,
  htmlHandler: htmlHandler,
  imgHandler: imgHandler,
  delHandler: delHandler,
  webHandler: webHandler,
};

// 创建默认任务
//  作用：把所有的任务一起执行
//  依次执行：gulp.series()
//  并行：gulp.parallel()
//  返回值是一个函数，返回值可以被直接当做任务函数使用
//  使用 task 创建一个 default 任务
// 添加完毕服务器任务以后，修改 default 任务

module.exports.default = gulp.series(
  // 先 删除 之前打包压缩内容
  delHandler,
  // 在 执行 新的打包压缩 让压缩文件内容和当前源文件内容同步
  gulp.parallel(cssHandler, sassHandler, jsHandler, htmlHandler, imgHandler),
  webHandler,
  // 监听事件
  watchHandler
);

module.exports.build = gulp.series(
  // 先 删除 之前打包压缩内容
  delHandler,
  // 在 执行 新的打包压缩 让压缩文件内容和当前源文件内容同步
  gulp.parallel(cssHandler, sassHandler, jsHandler, htmlHandler, imgHandler)
);
