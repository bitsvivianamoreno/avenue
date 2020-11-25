const gulp = require('gulp');
const loaded    = require('gulp-load-plugins')();

const sassPath = {
    	includePaths: ["node_modules"]
    };

const prefix = {
      browsers: ['last 2 versions', 'ie >= 9']
    };

gulp.task('sass', () => {
  return gulp.src('assets/scss/app.scss')
    .pipe(loaded.sass(sassPath).on('error', loaded.sass.logError))
    .pipe(loaded.autoprefixer(prefix))
    .pipe(gulp.dest('assets/css/'));
});

gulp.task('default', ['sass'], () => {
  gulp.watch(['scss/**/*.scss'], ['sass']);
});

