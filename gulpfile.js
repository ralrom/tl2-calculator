var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var jsonminify = require('gulp-jsonminify');
var watch = require('gulp-watch');

gulp.task('default', function(){
	gulp.start('sass');
	gulp.start('uglify');
	gulp.start('htmlmin');
	gulp.start('jsonmin');
	gulp.start('copy');
});

// Convert all sass files to css
gulp.task('sass', function() {
	gulp.src('./src/sass/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(gulp.dest('./dist/css'));
});

// Minify javascript files
gulp.task('uglify', function() {
	gulp.src('./src/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('./dist/js'))
});

// Minify index.html
gulp.task('htmlmin', function() {
	gulp.src('./src/index.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('./dist'))
});

// Minify json files
gulp.task('jsonmin', function() {
	gulp.src('./src/data/*.json')
		.pipe(jsonminify())
		.pipe(gulp.dest('./dist/data'))
});

// Copy files to distribution folder
gulp.task('copy', function() {
	gulp.src('./src/img/**')
		.pipe(gulp.dest('./dist/img'))
	gulp.src('./src/font/**')
		.pipe(gulp.dest('./dist/font'))
});

gulp.task('watch', function() {
	watch('./src/sass/*.scss', function() {
		gulp.start('sass');
	});
	watch('./src/js/*.js', function() {
		gulp.start('uglify');
	});
	watch('./src/index.html', function() {
		gulp.start('htmlmin');
	});
	watch('./src/data/*.json', function() {
		gulp.start('jsonmin');
	});
	watch('./src/img/**', function() {
		gulp.start('copy');
	});
	watch('./src/font/**', function() {
		gulp.start('copy');
	});
});
