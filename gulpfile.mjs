import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import newer from 'gulp-newer';
import inject from 'gulp-inject-string';
import fs from 'fs';
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

// Define 'del' as a variable, and import it using a dynamic import
let del;

gulp.task('import-del', async () => {
  del = (await import('del')).deleteSync;
});

gulp.task('delete-index', async () => {
  if (!del) {
    await gulp.series('import-del')();
  }

  //delete ./public/index.html
  await del('./public/index.html');
});

gulp.task('copy', () => {
  return gulp
    .src(srcFiles, { base: './' }) // Added the 'base' option to keep folder structure
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
});

gulp.task('add-gtag', function (done) {
  const gtagCode = `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-R42YRRG1Y1"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'G-R42YRRG1Y1');
</script>
`;

  // Add a delay before running the task
  setTimeout(() => {
    gulp
      .src('./public/index.html')
      .pipe(inject.after('</head>', gtagCode))
      .pipe(gulp.dest('public'))
      .on('end', done);
  }, 3000);
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
  return gulp.src(node_modules)  // This is the source folder which you want to copy
      .pipe(gulp.dest(dest + "/node_modules"));
});

gulp.task('copy-fonts', function(){
  return gulp.src(webfonts)
      .pipe(gulp.dest(dest + "/webfonts")); // This is the destination folder where you want to paste
});

gulp.task('copy-images', function(){
  return gulp.src("./images/**")
      .pipe(gulp.dest(dest + "/images")); // This is the destination folder where you want to paste
});

gulp.task('clean', async () => {
  return await del([dest + '/**/*', '!' + dest], { force: true });
});

gulp.task('rename-index', function() {
  return gulp.src(dest + '/index*.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest(dest));
});

// Combine 'import-del', 'delete-index', 'copy', and 'add-gtag' tasks as part of the 'default' task
gulp.task('default', gulp.series('import-del', 'clean', 'copy', 'revReplace', 'copy_modules', 'copy-fonts', 'copy-images', 'rename-index'));
