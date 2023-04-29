import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import newer from 'gulp-newer';
import inject from 'gulp-inject-string';
import fs from 'fs';

const srcFiles = [
  './styles/**/*',
  './node_modules/**/*',
  './web-fonts/**/*',
  './js/**/*',
  './images/**/*',
  './index.html',
  './index.scss',
  './index.js',
  './manifest.webmanifest',
];
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

// Combine 'import-del', 'delete-index', 'copy', and 'add-gtag' tasks as part of the 'default' task
gulp.task('default', gulp.series('import-del', 'delete-index', 'copy', 'add-gtag'));
