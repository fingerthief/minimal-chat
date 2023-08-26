// Import all the required gulp plugins
import gulp from 'gulp';
import newer from 'gulp-newer';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';

// Array of source files to be processed by gulp
const srcFiles = [
  './styles/**/*',
  './node_modules/**/*',
  './webfonts/**/*',
  './js/**/*',
  './images/**/*',
  './index.html',
  './index.js',
  './manifest.webmanifest',
  '!./webfonts/**',
  '!./images/**',
  '!./node_modules/**/*',
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

//delete hash named index file
gulp.task('delete-hash-index', async () => {
  return await del([dest + '/index-*.html'], { force: true });
});

// Task to minify JavaScript files
gulp.task('minify-js', function() {
  return gulp.src(dest + '/js/**/*.js') // Source of JavaScript files
    .pipe(uglify()) // Apply uglify for minification
    .pipe(gulp.dest(dest + '/js')); // Output directory
});

// Task to minify CSS files
gulp.task('minify-css', function() {
  return gulp.src(dest + '/styles/**/*.css') // Source of CSS files
    .pipe(cleanCSS()) // Apply cleanCSS for minification
    .pipe(gulp.dest(dest + '/styles')); // Output directory
});

// Task to minify HTML files
gulp.task('minify-html', function() {
  return gulp.src(dest + '/*.html') // Source of HTML files
    .pipe(htmlmin({ collapseWhitespace: true })) // Apply htmlmin for minification
    .pipe(gulp.dest(dest)); // Output directory
});

// gulp.task('rollup', function() {
//   return gulp.src('./**/*.js')
//     .pipe(sourcemaps.init())
//     .pipe(rollup({
//       // any option supported by Rollup can be set here, including sourceMap
//       input: './src/main.js',
//       output: {
//         format: 'umd'
//       },
//       plugins: [
//         babel({
//           exclude: 'node_modules/**', // only transpile our source code
//           presets: ['@babel/env']
//         }),
//         resolve(),
//         commonjs()
//       ]
//     }))
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest(dest + '/js'));
// });

// The 'default' task runs all the tasks in the specified order
gulp.task('default', gulp.series('import-del', 'clean', 'copy', 'minify-js', 'minify-css', 'minify-html', 'revReplace', 'copy_modules', 'copy-fonts', 'copy-images', 'rename-index', 'delete-hash-index'));