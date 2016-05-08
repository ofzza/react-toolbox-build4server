/**
 * GULP file
 *
 * This Node script is executed when you run `gulp`. It's purpose is
 * to load the Gulp tasks in your project's `tasks` folder, and allow
 * you to add and remove tasks as you see fit.
 *
 * WARNING:
 * Unless you know what you're doing, you shouldn't change this file.
 * Check out the `tasks` directory instead.
 */

var path        = require('path'),
    _           = require('lodash');
    gulp        = require('gulp'),
    gulpSync    = require('gulp-sync')(gulp),
    gulpClean   = require('gulp-clean'),
    gulpConcat  = require('gulp-concat'),
    gulpRename  = require("gulp-rename"),
    gulpSrcmaps = require('gulp-sourcemaps'),
    gulpSass    = require('gulp-sass'),
    gulpBabel   = require('gulp-babel'),
    gulpPostcss = require('gulp-postcss'),
    postcss     = require('postcss'),
    pcssPrefixer= require('autoprefixer'),
    pcssImport  = require('postcss-partial-import'),
    pcssScss    = require('postcss-scss'),
    pcssHash    = require('./postcss-hash-classname'),
    through     = require('through2');


/**
 * Compiles react-toolbox
 * @param src React-toolbox source directory (usually: "node_modules/react-toolbox")
 * @param dest Compiled code destination directory
 */
module.exports = function (src, dest) {

    // Process .scss files and make then natively require-able from node
    // -----------------------------------------------------------------------------------------------------------------
    {
        // Clear destination directory of content (before compilation)
        gulp.task('clear', function () {
            return gulp.src(dest, {read: false})
                .pipe(gulpClean({force: true}));
        });

        // Copy react-toolbox code into destination directory for compilation
        gulp.task('copy.react-toolbox', function () {
            return gulp.src([src + '/components/**/*'])
                .pipe(gulp.dest(dest + '/jsx'));
        });
        // Copy normalize.css code into destination directory for compilation
        gulp.task('copy.normalize-css', function () {
            return gulp.src(['./node_modules/normalize.css/normalize.css'])
                .pipe(gulpRename(function (path) {
                    path.basename = '~normalize';
                    path.extname = '.css';
                }))
                .pipe(gulp.dest(dest + '/jsx'))
                .pipe(gulpRename(function (path) {
                    path.basename = '~normalize';
                    path.extname = '.scss';
                }))
                .pipe(gulp.dest(dest + '/jsx'));
        });

        // Process .scss and make class-names unique
        gulp.task('scss.process.style', function () {
            return gulp.src([dest + '/jsx/**/*.scss'])
                .pipe(through.obj(function (file, enc, cb) {
                    // Append configuration file inclusion on top
                    file.contents = new Buffer(
                        '@import "' + __dirname + '/' + src + '/components/colors";\r\n\r\n' +
                        file.contents
                    );
                    cb(null, file);
                }))
                .pipe(
                    gulpPostcss(
                        [
                            // Import outside files
                            pcssImport({ extension: 'scss' }),
                            // Browser prefixing
                            pcssPrefixer()
                        ],
                        {syntax: pcssScss}
                    )
                )
                .pipe(gulp.dest(dest + '/jsx'))
                .pipe(gulpSass())
                .pipe(gulp.dest(dest + '/jsx'));
        });

        // Fully process .scss and export class-name to unique class-name mapping file
        gulp.task('scss.process.js', function () {
            return gulp.src([dest + '/jsx/**/*.scss', dest + '/jsx/**/*.css'])
                .pipe(
                    gulpPostcss(
                        [
                            // Process classnames and output mappings
                            pcssHash({
                                hashType: 'sha512',
                                maxLength: 32,
                                classnameFormat: function (classname, src) {
                                    var parsed = path.parse(src),
                                        dir = parsed.dir.replace(/\\/g, '/').split('/'),
                                        filename = parsed.name.split('.');
                                    return 'rt-' + dir[dir.length - 1] + (filename.length > 1 ? '_' + filename.slice(1) : '') + '-' + classname;
                                },
                                output: function (src) {
                                    var parsed = path.parse(src);
                                    return (parsed.ext === '.css' ? parsed.dir + '/' + parsed.name + '.js' : parsed.dir + '/~' + parsed.name + '.incomplete.js');
                                }
                            })
                        ],
                        {syntax: pcssScss}
                    )
                )
                .pipe(gulp.dest(dest + '/jsx'));
        });


        // Clear destination directory of content (before compilation)
        gulp.task('scss.process.clear', function () {
            return gulp.src([dest + '/jsx/**/*.incomplete.js', dest + '/jsx/**/*.css'], {read: false})
                .pipe(gulpClean({force: true}));
        });

        // Read a class-name to unique class-name mappings for each .scss file and fix remaining class-name replacements
        gulp.task('scss.process.finish', function () {
            return gulp.src([dest + '/jsx/**/style*.scss'])
                .pipe(through.obj(function (file, enc, cb) {
                    // Get JS mappings
                    var filePath = path.parse(file.path),
                        classNames = require(path.join(filePath.dir, filePath.name + '.js'));
                    // Process file contents
                    var contents = file.contents.toString();
                    _.forEach(classNames, function (newClassName, oldClassName) {
                        if (oldClassName) contents = contents.replace(new RegExp(('\\.' + oldClassName), 'g'), ('classname[' + oldClassName.replace(/-/g, '\\-') + ']'));
                    });
                    _.forEach(classNames, function (newClassName, oldClassName)  {
                        if (oldClassName) contents = contents.replace(new RegExp(('classname\\[' + oldClassName.replace(/-/g, '\\-') + '\\]'), 'g'), ('.' + newClassName));
                    });
                    // Done processing file
                    file.contents = new Buffer(contents);
                    cb(null, file);
                }))
                .pipe(gulp.dest(dest + '/jsx'))
                .pipe(gulpSass())
                .pipe(gulp.dest(dest + '/jsx'));

        });

    }

    // Aggregate and compile all .scss files for easier inclusion into a project
    // -----------------------------------------------------------------------------------------------------------------
    {

        // Concatenate all configuration .scss files
        gulp.task('concat.colors.scss', function () {
            return gulp.src([src + '/components/_colors.scss'])
                .pipe(gulpConcat('style-colors.scss'))
                .pipe(gulp.dest(dest));
        });

        // Concatenate all configuration .scss files
        gulp.task('concat.config.scss', function () {
            return gulp.src([src + '/components/_globals.scss', dest + '/jsx/**/_config*.scss'])
                .pipe(through.obj(function (file, enc, cb) {
                    // Wrap contents into a section with a filename comment
                    var parsedPath = path.parse(file.path),
                        dir = parsedPath.dir.replace(/\\/g, '/').split('/');
                    file.contents = new Buffer(
                        '/* REACT-TOOLBOX CONFIGURATION: "' + (parsedPath.name == '_globals' ? 'GLOBALS' : dir[dir.length - 1]).toUpperCase() + '": */\r\n' +
                        file.contents +
                        '\r\n\r\n'
                    );
                    cb(null, file);
                }))
                .pipe(gulpConcat('style-config.scss'))
                .pipe(gulp.dest(dest));
        });

        // Concatenate all style .scss files
        gulp.task('concat.style.scss', function () {
            return gulp.src([dest + '/jsx/**/style*.scss'])
                .pipe(gulpConcat('style.scss'))
                .pipe(through.obj(function (file, enc, cb) {
                    // Append configuration file inclusion on top
                    file.contents = new Buffer(
                        '@import "style-colors";\r\n\r\n' +
                        '@import "style-config";\r\n\r\n' +
                        file.contents
                    );
                    cb(null, file);
                }))
                .pipe(gulp.dest(dest));
        });

        // Pre-include custom theme file and compile .css files
        gulp.task('compile.style.scss', function () {
            return gulp.src([dest + '/style.scss'])
                .pipe(gulpSrcmaps.init())
                .pipe(gulpSass())
                .pipe(gulpSrcmaps.write('.'))
                .pipe(gulp.dest(dest));
        });

    }

    // Compile React .jsx files
    // -----------------------------------------------------------------------------------------------------------------
    {

        // Copy over processed .scss to .js style files
        gulp.task('copy.react-toolbox.style', function () {
            return gulp.src([dest + '/jsx/**/*'])
                .pipe(gulp.dest(dest + '/js'));
        });

        // Broserify react-toolbox JSX code
        gulp.task('transpile.react-toolbox.jsx', function () {
            return gulp.src([dest + '/jsx/**/*.js', '!' + dest + '/jsx/**/style*.js', dest + '/jsx/**/*.jsx', '!' + dest + '/jsx/**/style*.jsx'])
                .pipe(gulpSrcmaps.init())
                .pipe(gulpBabel({ presets: ['es2015', 'stage-0', 'react'] }))
                .pipe(gulpSrcmaps.write('.'))
                .pipe(gulp.dest(dest + '/js'));
        });

    }

    // Broserify react-toolbox JS code for easy inclusion into a project
    // -----------------------------------------------------------------------------------------------------------------
    {

        // Expose Broserified react-toolbox's main entry point
        gulp.task('transpile.react-toolbox.index', function () {
            return gulp.src([dest + '/js/index.js'])
                .pipe(through.obj(function (file, enc, cb) {
                    // Require and export js/index.js
                    file.contents = new Buffer('module.exports = require("./js/index.js");');
                    cb(null, file);
                }))
                .pipe(gulp.dest(dest));
        });

    }

    // Compile demo.jsx
    // -----------------------------------------------------------------------------------------------------------------
    {

        // Broserify react-toolbox JSX code
        gulp.task('transpile.demo', function () {
            return gulp.src(['demo.jsx'])
                .pipe(gulpSrcmaps.init())
                .pipe(gulpBabel({ presets: ['es2015', 'stage-0', 'react'] }))
                .pipe(gulpSrcmaps.write('.'))
                .pipe(gulp.dest('./'));
        });

    }


    // Define main tasks
    // -----------------------------------------------------------------------------------------------------------------
    gulp.task('require.scss',   gulpSync.sync(['copy.react-toolbox', 'copy.normalize-css', 'scss.process.style', 'scss.process.js', 'scss.process.clear', 'scss.process.finish']));
    gulp.task('compile.scss',   gulpSync.sync(['concat.colors.scss', 'concat.config.scss', 'concat.style.scss', 'compile.style.scss']));
    gulp.task('compile.jsx',    gulpSync.sync(['copy.react-toolbox.style', 'transpile.react-toolbox.jsx']));
    gulp.task('compile.index',  gulpSync.sync(['transpile.react-toolbox.index']));
    gulp.task('compile.demo',   gulpSync.sync(['transpile.demo']));
    gulp.task('default',        gulpSync.sync(['clear', 'require.scss', 'compile.scss', 'compile.jsx', 'compile.index', 'compile.demo']));

};

// Execute
module.exports('./node_modules/react-toolbox', './react-toolbox');
