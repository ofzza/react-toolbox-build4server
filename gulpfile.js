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

// Require from local node_modules, in case of inclusion from another project
var fs          = require('fs'),
    path        = require('path'),
    _           = require('lodash'),
    colors      = require('colors'),
    gulpLocal   = require('gulp'),
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
    pcssHash    = require('postcss-hash-classname'),
    through     = require('through2');


/**
 * Compiles react-toolbox
 * @param gulp Reference to a Gulp instance used to define tasks
 * @param src React-toolbox source directory (usually: "node_modules/react-toolbox")
 * @param dest Compiled code destination directory
 * @param scssPrepend Path or array of paths to .scss files to be prepended to react-toolbox styling before compilation into .css
 */
module.exports = function (gulp, src, dest, scssPrepend) {

    // Prompt configuration
    console.log('REACT-TOOLBOX-BUILD4SERVER Configuration: '.green);
    console.log('> React-Toolbox Source:'.green + '    "' + src + '"');
    console.log('> Build Destination:   '.green + '    "' + dest + '"');
    if (scssPrepend) {
        console.log('> Additional .scss files:'.green);
        _.forEach(typeof scssPrepend === 'string' ? [ scssPrepend ] : scssPrepend, function (scss) {
            console.log('       "' + scss + '"');
        });
    }

    // Process .scss files and make then natively require-able from node
    // -----------------------------------------------------------------------------------------------------------------
    {
        // Clear destination directory of content (before compilation)
        gulp.task('react-toolbox-build4server.clear', function () {
            return gulp.src(dest, {read: false})
                .pipe(gulpClean({force: true}));
        });

        // Copy react-toolbox code into destination directory for compilation
        gulp.task('react-toolbox-build4server.copy.react-toolbox', function () {
            return gulp.src(
                path.join(src, 'components/**/*')
            )
                .pipe(gulp.dest(
                    path.join(dest, 'jsx')
                ));
        });

        // Detect location of normalize.css module (as peer dependency or as local dependency)
        var normalizeSrcPath = path.join(__dirname, '../normalize.css/normalize.css');
        try {
            var stats = fs.statSync(normalizeSrcPath)
            if (!stats || !stats.isFile()) {
                normalizeSrcPath = path.join(__dirname, './node_modules/normalize.css/normalize.css');
            }
        } catch (err) {
            normalizeSrcPath = path.join(__dirname, './node_modules/normalize.css/normalize.css');
        }
        // Copy normalize.css code into destination directory for compilation
        gulp.task('react-toolbox-build4server.copy.normalize-css', function () {
            return gulp.src( normalizeSrcPath )
                .pipe(gulpRename(function (path) {
                    path.basename = '~normalize';
                    path.extname = '.css';
                }))
                .pipe(gulp.dest( path.join(dest, '/jsx') ))
                .pipe(gulpRename(function (path) {
                    path.basename = '~normalize';
                    path.extname = '.scss';
                }))
                .pipe(gulp.dest(
                    path.join(dest, 'jsx')
                ));
        });

        // Process .scss and make class-names unique
        gulp.task('react-toolbox-build4server.scss.process.style', function () {
            return gulp.src(
                path.join(dest, 'jsx/**/*.scss')
            )
                .pipe(through.obj(function (file, enc, cb) {
                    // Append configuration file inclusion on top
                    file.contents = new Buffer(
                        '@import "' + path.join(src, 'components/colors') + '";\r\n\r\n' +
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
                .pipe(gulp.dest(
                    path.join(dest, 'jsx')
                ))
                .pipe(gulpSass())
                .pipe(gulp.dest(
                    path.join(dest, 'jsx')
                ));
        });

        // Fully process .scss and export class-name to unique class-name mapping file
        gulp.task('react-toolbox-build4server.scss.process.js', function () {
            return gulp.src([
                path.join(dest, 'jsx/**/*.scss'),
                path.join(dest, 'jsx/**/*.css')
            ])
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
                .pipe(gulp.dest(
                    path.join(dest, 'jsx')
                ));
        });


        // Clear destination directory of content (before compilation)
        gulp.task('react-toolbox-build4server.scss.process.clear', function () {
            return gulp.src([
                path.join(dest, 'jsx/**/*.incomplete.js'),
                path.join(dest, 'jsx/**/*.css')
            ], {read: false})
                .pipe(gulpClean({force: true}));
        });

        // Read a class-name to unique class-name mappings for each .scss file and fix remaining class-name replacements
        gulp.task('react-toolbox-build4server.scss.process.finish', function () {
            return gulp.src(
                path.join(dest, 'jsx/**/style*.scss')
            )
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
                .pipe(gulp.dest(
                    path.join(dest, 'jsx')
                ))
                .pipe(gulpSass())
                .pipe(gulp.dest(
                    path.join(dest, 'jsx')
                ));

        });

    }

    // Aggregate and compile all .scss files for easier inclusion into a project
    // -----------------------------------------------------------------------------------------------------------------
    {

        // Concatenate all configuration .scss files
        gulp.task('react-toolbox-build4server.concat.colors.scss', function () {
            return gulp.src(
                path.join(src, 'components/_colors.scss')
            )
                .pipe(gulpConcat('style-colors.scss'))
                .pipe(gulp.dest(dest));
        });

        // Concatenate all configuration .scss files
        gulp.task('react-toolbox-build4server.concat.config.scss', function () {
            return gulp.src([
                path.join(src, 'components/_globals.scss'),
                path.join(dest, 'jsx/**/_config*.scss')
            ])
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
        gulp.task('react-toolbox-build4server.concat.style.scss', function () {
            return gulp.src(
                path.join(dest, 'jsx/**/style*.scss')
            )
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

        // Pre-include custom theme file(s) and compile .scss into .css files
        gulp.task('react-toolbox-build4server.compile.style.scss', function () {
            return gulp.src( path.join(dest, 'style.scss') )
                .pipe(through.obj(function (file, enc, cb) {
                    // Read custom theme files
                    var imports = '';
                    _.forEach((typeof scssPrepend === 'string' ? [ scssPrepend ] : scssPrepend), function (file) {
                        imports += '/* Imported from "' + file + '" */' +
                            fs.readFileSync(file).toString() +
                            '\r\n\r\n';
                    });

                    // Append configuration file inclusion on top
                    file.contents = new Buffer(imports + file.contents);
                    cb(null, file);
                }))                .pipe(gulpSrcmaps.init())
                .pipe(gulpSass())
                .pipe(gulpSrcmaps.write('.'))
                .pipe(gulp.dest(dest));
        });

    }

    // Compile React .jsx files
    // -----------------------------------------------------------------------------------------------------------------
    {

        // Copy over processed .scss to .js style files
        gulp.task('react-toolbox-build4server.copy.react-toolbox.style', function () {
            return gulp.src( path.join(dest, 'jsx/**/*') )
                .pipe(gulp.dest( path.join(dest, 'js') ));
        });

        // Broserify react-toolbox JSX code
        gulp.task('react-toolbox-build4server.transpile.react-toolbox.jsx', function () {
            return gulp.src([
                path.join(dest, 'jsx/**/*.js'),
                '!' + path.join(dest, 'jsx/**/style*.js'),
                path.join(dest, 'jsx/**/*.jsx'),
                '!' + path.join(dest, 'jsx/**/style*.jsx')
            ])
                .pipe(gulpSrcmaps.init())
                .pipe(gulpBabel({ presets: ['es2015', 'stage-0', 'react'] }))
                .pipe(gulpSrcmaps.write('.'))
                .pipe(gulp.dest(
                    path.join(dest, 'js')
                ));
        });

    }

    // Broserify react-toolbox JS code for easy inclusion into a project
    // -----------------------------------------------------------------------------------------------------------------
    {

        // Expose Broserified react-toolbox's main entry point
        gulp.task('react-toolbox-build4server.transpile.react-toolbox.index', function () {
            return gulp.src(
                path.join(dest, 'js/index.js')
            )
                .pipe(through.obj(function (file, enc, cb) {
                    // Require and export js/index.js
                    file.contents = new Buffer('module.exports = require("./js/index.js");');
                    cb(null, file);
                }))
                .pipe(gulp.dest(dest));
        });

    }

    // Define main task
    // -----------------------------------------------------------------------------------------------------------------
    gulp.task('react-toolbox-build4server', require('gulp-sync')(gulp).sync([

        'react-toolbox-build4server.clear',

        'react-toolbox-build4server.concat.colors.scss',
        'react-toolbox-build4server.concat.config.scss',

        'react-toolbox-build4server.copy.react-toolbox',
        'react-toolbox-build4server.copy.normalize-css',
        'react-toolbox-build4server.scss.process.style',
        'react-toolbox-build4server.scss.process.js',
        'react-toolbox-build4server.scss.process.clear',
        'react-toolbox-build4server.scss.process.finish',

        'react-toolbox-build4server.concat.style.scss',
        'react-toolbox-build4server.compile.style.scss',

        'react-toolbox-build4server.copy.react-toolbox.style',
        'react-toolbox-build4server.transpile.react-toolbox.jsx',

        'react-toolbox-build4server.transpile.react-toolbox.index'

    ]));

};

// Check if GULP called locally to this project or if this file is being included into an outside project
var gulpfileModule = _.find(require.main.children, function (child) {
    return (_.last(child.filename.replace(/\\/g, '/').split('/')) == 'gulpfile.js');
});
if (gulpfileModule.filename.indexOf('react-toolbox-build4server') >= 0) {

    // Prompt detected direct run
    console.log('REACT-TOOLBOX-BUILD4SERVER: '.green + 'Detected direct build in project directory.');

    // Find react-toolbox path
    var parsedDir = __dirname.replace(/\\/g, '/').split('/'),
        parentDir = (parsedDir.length >= 2 ? parsedDir[parsedDir.length - 2] : null);

    // Detect location of react-toolbox module (as peer dependency or as local dependency)
    var rtSrcPath = path.join(__dirname, '../react-toolbox');
    try {
        var stats = fs.statSync(rtSrcPath)
        if (!stats || !stats.isDirectory()) {
            rtSrcPath = path.join(__dirname, './node_modules/react-toolbox');
        }
    } catch (err) {
        rtSrcPath = path.join(__dirname, './node_modules/react-toolbox');
    }
    // Configure tasks
    module.exports(
        gulpLocal,
        rtSrcPath,
        path.join(__dirname, 'react-toolbox')
    );

    // Expose compile demo task
    gulpLocal.task('react-toolbox-build4server.transpile.demo', function () {
        return gulpLocal.src('demo.jsx')
            .pipe(gulpSrcmaps.init())
            .pipe(gulpBabel({ presets: ['es2015', 'stage-0', 'react'] }))
            .pipe(gulpSrcmaps.write('.'))
            .pipe(gulpLocal.dest('./'));
    });

    // Expose default task
    gulpLocal.task('default', ['react-toolbox-build4server', 'react-toolbox-build4server.transpile.demo']);

} else {

    // Prompt detected direct run
    var hostPathSplit = gulpfileModule.filename.replace(/\\/g, '/').split('/'),
        hostPath = hostPathSplit.slice(0, hostPathSplit.length - 1).join('/');
    console.log('REACT-TOOLBOX-BUILD4SERVER: '.green + 'Detected inclusion into host project build procedure at "' + hostPath + '".');

}
