var autoprefixer = require('gulp-autoprefixer');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

const { src, dest, task, series } = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');


function cssCompile(cb) {
    
  src('./scss/**/*.scss')
	.pipe(sass.sync({
	    outputStyle: 'expanded'
	}).on('error', sass.logError))
	.pipe(autoprefixer({
	    browsers: ['last 2 versions'],
	    cascade: false
	})).pipe(dest('./css'));
    cb();
}


function vendor(cb) {

    // Bootstrap
    src([
	'./node_modules/bootstrap/dist/**/*',
	'!./node_modules/bootstrap/dist/css/bootstrap-grid*',
	'!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
	.pipe(dest('./vendor/bootstrap'))

    // Font Awesome
    src([
	'./node_modules/@fortawesome/**/*',
    ])
	.pipe(dest('./vendor'))

    // jQuery
    src([
	'./node_modules/jquery/dist/*',
	'!./node_modules/jquery/dist/core.js'
    ])
	.pipe(dest('./vendor/jquery'))

    // jQuery Easing
    src([
	'./node_modules/jquery.easing/*.js'
    ])
	.pipe(dest('./vendor/jquery-easing'));

    cb();
}

function minifyJS(cb) {

    src([
	'./js/*.js',
	'!./js/*.min.js'
    ])
	.pipe(uglify())
	.pipe(rename({
	    suffix: '.min'
	}))
	.pipe(dest('./js'))
	.pipe(browserSync.stream());
    cb();
}


function minifyCSS(cb) {
    src([
	'./css/*.css',
	'!./css/*.min.css'
    ])
	.pipe(cleanCSS())
	.pipe(rename({
	    suffix: '.min'
	}))
	.pipe(dest('./css'))
	.pipe(browserSync.stream());

    cb();
}



//
// browserSync
//
function browser(cb) {

    browserSync.init({
	server: {
	    baseDir: "./"
	}
    });
    cb();
}

task(browser);
task(minifyJS);
task(minifyCSS);
task(cssCompile);
task(vendor);


function defaultTask(cb) {
    // place code for your default task here

    cb();    
}

exports.default = series(cssCompile, minifyJS, minifyCSS, vendor, browser)
