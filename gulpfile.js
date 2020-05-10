// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');
const closureCompiler = require('google-closure-compiler').gulp();
const browsersync = require('browser-sync');

const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

function compileSass () {
    return gulp.src('./sass/*.scss')
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest('./assets/css'))
}

function compileJS () {
    return gulp.src('./ts/*.ts', {base: './'})
            .pipe(webpackStream(webpackConfig, webpack))
            .pipe(gulp.dest('./assets/js'));
}

function optimizeJS () {
    return gulp.src('./assets/js/output.js', {base: './'})
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
}

function buildServer (done) {
    browsersync.init({
        server: {
            baseDir: "./",
        }
    });
    done();
}

function browserReload (done){
    browsersync.reload();
    done();
}

function watch () {
    gulp.watch('./*.html', gulp.series(browserReload));
    gulp.watch('./sass/*.scss', gulp.series(compileSass, browserReload));
    gulp.watch('./ts/*.ts', gulp.series(compileJS, browserReload));
}

const defaultTasks = gulp.series(buildServer, watch);
gulp.task('default', defaultTasks);
