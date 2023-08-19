// Import all the required gulp plugins
import gulp from 'gulp';
import newer from 'gulp-newer';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import rename from 'gulp-rename';

// Array of source files to be processed by gulp
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

// Directories to be used later
const node_modules = './node_modules/**/*';
const webfonts = './webfonts/**';

// Destination directory for gulp to output processed files
const dest = './public';

let del;

// Task to import the 'del' package, which is used for deleting files 
gulp.task('import-del', async () => {
  del = (await import('del')).deleteSync;
});

// 'copy' task handles source files update and renaming them for cache busting
gulp.task('copy', () => {
  return gulp
    .src(srcFiles, { base: './' }) // Keep original folder structure
    .pipe(newer(dest)) // Only process newer files
    .pipe(rev()) // Rename files for cache busting
    .pipe(gulp.dest(dest)) // Write the renamed files
    .pipe(rev.manifest()) // Create a manifest file
    .pipe(gulp.dest(dest)); // Write the manifest file
});

// 'revReplace' task substitutes new filenames into their references
gulp.task('revReplace', () => {
  var manifest = gulp.src(dest + "/rev-manifest.json");

  return gulp.src(dest + "/**/**")
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest(dest));
});

// Task to copy node_modules directory to public directory
gulp.task('copy_modules', function(){
  return gulp.src(node_modules)
      .pipe(newer(dest + "/node_modules")) 
      .pipe(gulp.dest(dest + "/node_modules"));
});

// Task to copy webfonts directory to public directory
gulp.task('copy-fonts', function(){
  return gulp.src(webfonts)
      .pipe(newer(dest + "/webfonts"))
      .pipe(gulp.dest(dest + "/webfonts"));
});

// Task to copy images directory to public directory
gulp.task('copy-images', function(){
  return gulp.src("./images")
      .pipe(newer(dest + "/images"))
      .pipe(gulp.dest(dest + "/images"));
});

// 'clean' task deletes all files in the 'public' directory, excluding webfonts. images and node_modules directories
gulp.task('clean', async () => {
  return await del([dest + '/**/*', '!' + dest, '!' + dest + '/webfonts/**', '!' + dest + '/node_modules/**',  '!' + dest + '/images/**'], { force: true });
});

// 'rename-index' task ensures the main HTML file is named "index.html" as firebase requires
gulp.task('rename-index', function() {
  return gulp.src(dest + '/index*.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest(dest));
});

// The 'default' task runs all the tasks in the specified order
gulp.task('default', gulp.series('import-del', 'clean', 'copy', 'revReplace', 'copy_modules', 'copy-fonts', 'copy-images', 'rename-index'));