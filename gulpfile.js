var gulp        = require('gulp');
var jshint      = require('gulp-jshint');
var rimraf      = require('gulp-rimraf');
var runSequence = require('run-sequence');
var fs          = require('fs');
var coveralls   = require('gulp-coveralls');
var istanbul    = require('gulp-istanbul');
var isparta     = require('isparta');
var mocha       = require('gulp-mocha');
require('shelljs/global');



gulp.task('no.onlys', function (callback) {
    exec('find . -path "*/*.spec.js" -type f -exec grep -l "describe.only" {} + \n find . -path "*/*.spec.js" -type f -exec grep -l "it.only" {} +', function (code, output) { // jshint ignore:line
        if (output) return callback(new Error("The following files contain .only in their tests"));
        return callback();
    });
});

gulp.task('lint', ['clean'], function () {
    return gulp.src(['**/*.js', '!**/node_modules/**', '!**/server/migration/**', '!coverage/**/*.js'])
        .pipe(jshint({lookup: true}))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('unit_pre', function () {
    return gulp.src(['!cli/**', '**/*.js', '!runit.js', '!example.js', '!**/*.spec.js', '!**/node_modules/**/*.js', '!.debug/**/*.js', '!gulpfile.js', '!coverage/**/*.js', '!server/migration/**/*.js'])
        .pipe(istanbul({ // Covering files
            instrumenter: isparta.Instrumenter,
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            gulp.src(['**/*.unit.spec.js', '!**/node_modules/**/*.js'], {read: false})
                .pipe(mocha({reporter: 'spec', timeout: '10000'}))
                .pipe(istanbul.writeReports({
                    reporters: ['lcov'],
                    reportOpts: {dir: 'coverage'}
                }))
                .once('end', function () {
                    process.exit();
                });
        });
});

gulp.task('clean', function () {
    return gulp.src(['.coverdata', '.debug', '.coverrun'], {read: false})
        .pipe(rimraf());
});

gulp.task('unit_test', function (callback) {
    runSequence('unit_pre',
        callback);
});

gulp.task('coveralls', function (callback) {
    var repo_token = process.env.COVERALLS_TOKEN;
    if (!repo_token) {
        return callback(new Error("COVERALLS_TOKEN environment variable is missing"));
    }
    else {
        fs.writeFile(".coveralls.yml", "service_name: codefresh-io\nrepo_token: " + repo_token, function (err) {
            if (err) {
                callback(err);
            }
            else {
                gulp.src('coverage/lcov.info')
                    .pipe(coveralls());
            }
        });
    }
});

gulp.task('e2e_test_pre', function () {
    return gulp.src(['e2e-test/flow.spec.js'])
        .pipe(istanbul({ // Covering files
            instrumenter: isparta.Instrumenter,
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            gulp.src(['e2e-test/flow.spec.js'], { read: false })
                .pipe(mocha({ reporter: 'spec', timeout: '10000' }))
                .pipe(istanbul.writeReports({
                    reporters: ['lcov'],
                    reportOpts: { dir: 'coverage' }
                }))
                .once('end', function () {
                    process.exit();
                });
        });
});

gulp.task('e2e_test', function (callback) {
    runSequence('e2e_test_pre',
        callback);
});

gulp.task('all_test_pre', () => {
    return gulp.src(['!cli/**', '**/*.js', '!runit.js', '!example.js', '!**/*.spec.js', '!**/node_modules/**/*.js', '!.debug/**/*.js', '!gulpfile.js', '!coverage/**/*.js'])
        .pipe(istanbul({ // Covering files
            instrumenter: isparta.Instrumenter,
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            gulp.src(['**/*.unit.spec.js', '!**/node_modules/**/*.js', 'e2e-test/flow.spec.js'], {read: false})
                .pipe(mocha({reporter: 'spec', timeout: '10000'}))
                .pipe(istanbul.writeReports({
                    reporters: ['lcov'],
                    reportOpts: {dir: 'coverage'}
                }))
                .once('end', function () {
                    process.exit();
                });
        });
});

gulp.task('all_test', function(cb){
    runSequence('all_test_pre', cb);
});