// Import tasks config
var config = require("../config");

// Import necessary libs
var gulp = require("gulp");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");

gulp.task("test", function () {
  return browserify(config.test.srcPath+config.test.srcFile, {debug: false})
    .transform(babelify)
    .bundle()
    .pipe(source(config.test.destFile))
    .pipe(gulp.dest(config.test.destPath));
});

gulp.task("test-watch", function () {
  return gulp.watch([config.test.srcPath + "*", config.test.srcPath + "*/*", config.js.srcPath + "*"], ["test"]);
});