// Import tasks config
var config = require("../config");

// Import necessary libs
var gulp = require("gulp");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");

gulp.task("js", function () {
  return browserify(config.js.srcPath+config.js.srcFile, {debug: true})
    .transform(babelify)
    .bundle()
    .pipe(source(config.js.destFile))
    .pipe(gulp.dest(config.js.destPath));
});

gulp.task("js-watch", function () {
  return gulp.watch([config.js.srcPath + "*", config.js.srcPath + "*/*"], ["js"]);
});