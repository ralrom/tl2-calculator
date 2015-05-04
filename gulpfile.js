// Nodejs dependencies
var fs = require('fs');
var gulp = require('gulp');
var sass = require('gulp-sass');
var jsonminify = require('gulp-jsonminify');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var consolidate = require('gulp-consolidate');
var swig = require('swig');

/*
 * Variables
*/
var trees = 3;
var skills = 10;

/*
 * Add all classes in the /src/characters/ directory to the calculator
*/
var characters = [];

// List all subdirectories in the "/src/characters" directory
var characterDirs = fs.readdirSync(__dirname + '/src/characters');

// Loop through each character directory to see if the files needed are there
for(var i = 0, u = characterDirs.length; i < u; i++){
	var characterFiles = fs.readdirSync(__dirname + '/src/characters/' + characterDirs[i]);
	var missingFile = false;

	// Make sure the skillset file is there (doesnt test file validity)
	if(characterFiles.indexOf('skillset.json') < 0){
		console.log('Missing skillset for ' + characterDirs[i]);
		missingFile = true;
	}

	// Notify if portrait is missing (but don't fail)
	if(characterFiles.indexOf('portrait.jpg') < 0){
		console.log('Missing portrait for ' + characterDirs[i]);
	}

	// Notify if skill icons are missing (but don't fail)
	if(characterFiles.indexOf('icons.jpg') < 0){
		console.log('Missing spell icons for ' + characterDirs[i]);
	}

	// If the necessary files are there, add the class to the calculator
	if(!missingFile){
		characters.push(characterDirs[i]);
	}
}

// Default tasks
gulp.task('default', function(){
	gulp.start('copy');
	gulp.start('sass');
	gulp.start('uglify');
	gulp.start('htmlify');
	gulp.start('jsonmin');
});

// Copy files to distribution folder
gulp.task('copy', function() {
	gulp.src('./src/characters/**/*.jpg')
		.pipe(gulp.dest('./dist/characters'))
	gulp.src('./src/tiny.gif')
		.pipe(gulp.dest('./dist'))
});

// Consolidate & Minify html
gulp.task('htmlify', function() {
	gulp.src('./src/index.html')
		.pipe(consolidate("swig", {
			characters: characters,
			trees: trees,
			skills: skills
		}))
		.pipe(htmlmin({
			collapseWhitespace: true,
			removeComments: true
		}))
		.pipe(gulp.dest('./dist'));
});

// Convert all sass files to css
gulp.task('sass', function() {
	gulp.src('./src/sass/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(gulp.dest('./dist'));
});

// Minify javascript files & use swig engine
gulp.task('uglify', function() {
	gulp.src('./src/calculator.js')
		.pipe(consolidate("swig", {
			trees: trees,
			skills: skills
		}))
		//.pipe(uglify())
		.pipe(gulp.dest('./dist'))
});

// Minify json files
gulp.task('jsonmin', function() {
	gulp.src('./src/characters/**/*.json')
		.pipe(jsonminify())
		.pipe(gulp.dest('./dist/characters'))
});
