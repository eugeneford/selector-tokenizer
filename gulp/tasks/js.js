// Import tasks config
var config = require("../config");

// Import necessary libs
var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("js", function () {
  return gulp.src(config.js.srcPath+config.js.srcFile)
    .pipe(babel())
    .pipe(gulp.dest(config.js.destPath));
});

gulp.task("js-watch", function () {
  return gulp.watch([config.js.srcPath + "*", config.js.srcPath + "*/*"], ["js"]);
});