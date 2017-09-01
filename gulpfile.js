/**
 * gulp
 * @authors Your Name (you@example.org)
 * @date    2017-08-30 14:45:03
 * @version $Id$
 */
"use strict"

// 引入gulp
const gulp		= require('gulp');					// 基础库

// 引入我们的gulp组件
const sass 		= require('gulp-compass'),			// CSS预处理/compass编译
	gulpHtmlmin = require('gulp-htmlmin'),			//html压缩
	inject		= require('gulp-inject'),			//html插入js css
	series 		= require('stream-series'),
	uglify 		= require('gulp-uglify'),			// JS文件压缩
	imagemin 	= require('gulp-imagemin'),			// imagemin 图片压缩
	pngquant 	= require('imagemin-pngquant'),		// imagemin 深度压缩
	browserSync = require("browser-sync").create(),	//浏览器实时刷新 
	rename 		= require('gulp-rename'),			// 文件重命名
	sourcemaps 	= require('gulp-sourcemaps'),		// 来源地图
	changed 	= require('gulp-changed'),			// 只操作有过修改的文件
	concat 		= require("gulp-concat"), 			// 文件合并
	clean 		= require('gulp-clean');			// 文件清理


/* = 全局设置
-------------------------------------------------------------- */
const baseUrl = 'YanPalace/';//项目目录
const srcPath = {
	html	: baseUrl + 'src',
	css		: baseUrl + 'src/scss',
	script	: baseUrl + 'src/js',
	image	: baseUrl + 'src/images'
};
const destPath = {
	html	: baseUrl + 'dist',
	css		: baseUrl + 'dist/scss',
	script	: baseUrl + 'dist/js',
	image	: baseUrl + 'dist/images'
};

/* = 开发环境( Ddevelop Task )
-------------------------------------------------------------- */
	// HTML处理
	gulp.task('htmlmin', function() {
		const options = {
		    removeComments: true,//清除HTML注释
		    collapseWhitespace: true,//压缩HTML
		    collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
		    removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
		    removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
		    removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
		    minifyJS: true,//压缩页面JS
		    minifyCSS: true//压缩页面CSS
		};

		// const sources = gulp.src([destPath.script+'/**/*.js', destPath.css+'/**/*.css'], {read: false});

		return gulp.src( srcPath.html+'/**/*.html' )
			.pipe(changed( destPath.html ))
			.pipe(gulpHtmlmin(options))
			.pipe(gulp.dest( destPath.html ));
	});

	// 插入
	gulp.task('inject', function(){
		// const sources = gulp.src([srcPath.script+'/**/*.js', srcPath.css+'/**/*.css'], {read: false});
		const csssource = gulp.src([srcPath.css+'/**/*.css'],{read: false});

		const vendorStream = gulp.src([srcPath.script+'/vendor/*.js'], {read: false});

		const appStream = gulp.src([srcPath.script+'/app/*.js'], {read: false});

		return gulp.src(srcPath.html+'/**/*.html')
			.pipe(inject(series(csssource, vendorStream, appStream),{relative: true})) 	// This will always inject vendor files before app files
			.pipe(gulp.dest(srcPath.html))
	})

	// compass 样式处理
	gulp.task('compass', function(){
		gulp.src(srcPath.css+'/**/*.scss')
		.pipe(compass({
			
		}))
	})


	// gulp.task('sass', function () {
	// 	return sass( srcPath.css, { style: 'compact', sourcemap: true }) // 指明源文件路径、并进行文件匹配（编译风格：简洁格式）
	// 		.on('error', function (err) {
	// 			console.error('Error!', err.message); // 显示错误信息
	// 		})
	// 		.pipe(sourcemaps.write('maps')) // 地图输出路径（存放位置）
	// 		.pipe(gulp.dest( destPath.css )); // 输出路径
	// });
	// JS文件压缩&重命名
	gulp.task('script', function() {
		return gulp.src( [srcPath.script+'/*.js','!'+srcPath.script+'/*.min.js'] ) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
			.pipe(changed( destPath.script )) // 对应匹配的文件
			.pipe(sourcemaps.init()) // 执行sourcemaps
			.pipe(rename({ suffix: '.min' })) // 重命名
			.pipe(uglify()) // 使用uglify进行压缩
			.pipe(sourcemaps.write('maps')) // 地图输出路径（存放位置）
			.pipe(gulp.dest( destPath.script )); // 输出路径
	});
	// imagemin 图片压缩
	gulp.task('images', function(){
		return gulp.src( srcPath.image+'/**/*' ) // 指明源文件路径，如需匹配指定格式的文件，可以写成 .{png,jpg,gif,svg}
			.pipe(changed( destPath.image ))
			.pipe(imagemin({
				progressive: true, // 无损压缩JPG图片
				svgoPlugins: [{removeViewBox: false}], // 不要移除svg的viewbox属性
				use: [pngquant()] // 深度压缩PNG
			}))
			.pipe(gulp.dest( destPath.image )); // 输出路径
	});
	// 文件合并
	gulp.task('concat', function () {
		return gulp.src( srcPath.script+'/vendor/*.js' )  // 要合并的文件
		.pipe(concat('libs.js')) // 合并成libs.js
		.pipe(rename({ suffix: '.min' })) // 重命名
		.pipe(gulp.dest( srcPath.script+'/vendor' )); // 输出路径
	});
	// 本地服务器
	gulp.task('default', ['inject'], function(){

		browserSync.init({
		    server: {
		      	baseDir: srcPath.html,
		      	index: './index.html'
		    },
		    // host: "192.168.1.103",
		    port: 8000,
		    //点击，滚动和表单在任何设备上输入将被镜像到所有设备里（当然你必须正确使用了Url)
		    ghostMode: {
		      	clicks: true,
		      	forms: true,
		      	scroll: true
		    },
		    logLevel: "info",
		    logPrefix: "我的项目",//改变控制台日志前缀
		    logConnections: true,
		    // browser: ["chrome"],
		    notify: false//不显示在浏览器中的任何通知。
		  });

		// gulp.watch(srcPath.css+'/**/*.scss', ['sass']);
  		gulp.watch(srcPath.html+'/**/*').on('change', browserSync.reload);
	});

	/* = 发布环境( Release Task )
-------------------------------------------------------------- */

	// 清理文件
	gulp.task('clean', function() {
		return gulp.src( [destPath.css+'/maps',destPath.script+'/maps'], {read: false} ) // 清理maps文件
			.pipe(clean());
	});
	// 样式处理
	// gulp.task('sassRelease', function () {
	// 	return sass( srcPath.css, { style: 'compressed' }) // 指明源文件路径、并进行文件匹配（编译风格：压缩）
	// 		.on('error', function (err) {
	// 			console.error('Error!', err.message); // 显示错误信息
	// 		})
	// 		.pipe(gulp.dest( destPath.css )); // 输出路径
	// });
	// 脚本压缩&重命名
	gulp.task('scriptRelease', function() {
		return gulp.src( [srcPath.script+'/**/*.js'] ) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
			.pipe(rename({ suffix: '.min' })) // 重命名
			.pipe(uglify()) // 使用uglify进行压缩
			.pipe(gulp.dest( destPath.script )); // 输出路径
	});
	// 打包发布
	gulp.task('build', ['clean', 'script', 'inject'], function(){ // 开始任务前会先执行[clean]任务
		return gulp.start('htmlmin','sassRelease','scriptRelease','images'); // 等[clean]任务执行完毕后再执行其他任务
	});

/* = 帮助提示( Help )
-------------------------------------------------------------- */
	gulp.task('help',function () {
		console.log('----------------- 开发环境 -----------------');
		console.log('gulp default		开发环境（默认任务）');
		console.log('gulp html		HTML处理');
		console.log('gulp sass		样式处理');
		console.log('gulp script		JS文件压缩&重命名');
		console.log('gulp images		图片压缩');
		console.log('gulp concat		文件合并');
		console.log('---------------- 发布环境 -----------------');
		console.log('gulp build		打包发布');
		console.log('gulp clean		清理文件');
		console.log('gulp sassRelease		样式处理');
		console.log('gulp scriptRelease	脚本压缩&重命名');
		console.log('---------------------------------------------');
	});

