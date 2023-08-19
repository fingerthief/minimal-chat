import gulp from 'gulp';
import newer from 'gulp-newer';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import rename from 'gulp-rename';

const srcFiles = [
  './styles/**/*',
  './node_modules/**/*',
  './webfonts/**/*',
  './js/**/*',
  './images/**/*',
  './index.html',
  './index.scss',
  './index.js',
  './manifest.webmanifest',
  '!./node_modules/**/*',
  '!./webfonts/**',
  '!./images/**'
];

const node_modules = './node_modules/**/*';
const webfonts = './webfonts/**';

const dest = './public';
let del;

gulp.task('import-del', async () => {
  del = (await import('del')).deleteSync;
});

gulp.task('copy', () => {
  return gulp
    .src(srcFiles, { base: './' }) // Added the 'base' option to keep folder structure
    .pipe(newer(dest))
    .pipe(rev()) // Rename all files for cache busting
    .pipe(gulp.dest(dest)) // Write the renamed files
    .pipe(rev.manifest()) // Create a manifest file
    .pipe(gulp.dest(dest)); // Write the manifest file
});

gulp.task('revReplace', () => {
  var manifest = gulp.src(dest + "/rev-manifest.json");

  return gulp.src(dest + "/**/**")
    .pipe(revReplace({manifest: manifest})) // Substitute in new filenames
    .pipe(gulp.dest(dest));
});

gulp.task('copy_modules', function(){
  return gulp.src(node_modules)
      .pipe(newer(dest + "/node_modules"))  // This is the source folder which you want to copy
      .pipe(gulp.dest(dest + "/node_modules"));
});

gulp.task('copy-fonts', function(){
  return gulp.src(webfonts)
      .pipe(newer(dest + "/webfonts"))
      .pipe(gulp.dest(dest + "/webfonts")); // This is the destination folder where you want to paste
});

gulp.task('copy-images', function(){
  return gulp.src("./images")
      .pipe(newer(dest + "/images"))
      .pipe(gulp.dest(dest + "/images")); // This is the destination folder where you want to paste
});

gulp.task('clean', async () => {
  return await del([dest + '/**/*', '!' + dest, '!' + dest + '/webfonts/**', '!' + dest + '/node_modules/**'], { force: true });
});

gulp.task('rename-index', function() {
  return gulp.src(dest + '/index*.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest(dest));
});

// Combine 'import-del', 'delete-index', 'copy', and 'add-gtag' tasks as part of the 'default' task
gulp.task('default', gulp.series('import-del', 'clean', 'copy', 'revReplace', 'copy_modules', 'copy-fonts', 'copy-images', 'rename-index'));
