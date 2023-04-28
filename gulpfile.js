const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const newer = require('gulp-newer');

const srcFiles = [
    './styles/**/*',
    './node_modules/**/*',
    './web-fonts/**/*',
    './js/**/*',
    './images/**/*',
    './index.html',
    './index.scss',
    './index.js',
    './manifest.webmanifest'
];
const dest = './public';

gulp.task('copy', () => {
  return gulp.src(srcFiles, { base: './' }) // Added the 'base' option to keep folder structure
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
});

gulp.task('default', gulp.series('copy'));
