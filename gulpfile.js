// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');
var closureCompiler = require('google-closure-compiler').gulp();

gulp.task('sass', function() {
    return gulp.src('./sass/*.scss')
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest('./assets/css'))
});
gulp.task('minifyjs', function() {
    return gulp.src('./js/*.js', {base: './'})
            .pipe(closureCompiler({
                compilation_level: 'SIMPLE',
                warning_level: 'QUIET',
                language_in: 'ECMASCRIPT_2015',
                language_out: 'ECMASCRIPT_2015',
                js_output_file: 'output.min.js'
                }, {
                platform: ['native', 'java', 'javascript']
                }))
            .pipe(gulp.dest('./assets/js'));
});

gulp.task('watch', function() {
    gulp.watch('./sass/*.scss', gulp.parallel('sass'));
    gulp.watch('./js/*.js', gulp.parallel('minifyjs'));
});

const defaultTasks = gulp.series('watch');
gulp.task('default', defaultTasks);
