// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');
//const closureCompiler = require('google-closure-compiler').gulp();
const typescript = require('gulp-typescript');
const browsersync = require('browser-sync');

gulp.task('sass', function() {
    return gulp.src('./sass/*.scss')
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest('./assets/css'))
});
gulp.task('compile-js', function() {
    return gulp.src('./ts/*.ts', {base: './'})
            .pipe(typescript({
                target: 'ES5',
                removeComments: true,
                out: 'output.min.js'
            }))
            /*
            .pipe(closureCompiler({
                compilation_level: 'SIMPLE',
                warning_level: 'QUIET',
                language_in: 'ECMASCRIPT_2015',
                language_out: 'ECMASCRIPT_2015',
                js_output_file: 'output.min.js'
                }, {
                platform: ['native', 'java', 'javascript']
                }))
            */
            .pipe(gulp.dest('./assets/js'));
});

gulp.task('build-server', function (done) {
    browsersync.init({
        server: {
            baseDir: "./",
        }
    });
    done();
});

gulp.task('browser-reload', function (done){
    browsersync.reload();
    done();
});

gulp.task('watch', function() {
    gulp.watch('./*.html', gulp.series('browser-reload'));
    gulp.watch('./sass/*.scss', gulp.series('sass', 'browser-reload'));
    gulp.watch('./ts/*.ts', gulp.series('compile-js', 'browser-reload'));
});

const defaultTasks = gulp.series('build-server', 'watch');
gulp.task('default', defaultTasks);
