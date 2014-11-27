module.exports = function (grunt) {
    grunt.initConfig({
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'dist/css/main.min.css': ['src/sass/main.scss']
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/js/calculator.min.js': ['src/js/calculator.js']
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': ['src/index.html']
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {expand: true, cwd: 'src/', src: ['img/**'], dest: 'dist/', filter: 'isFile'},
                    {expand: true, cwd: 'src/', src: ['font/**'], dest: 'dist/', filter: 'isFile'}
                ]
            }
        },
        jsonmin: {
            dist: {
                options: {
                    stripWhitespace: true,
                    stripComments: true
                },
                files: [
                    {expand: true, cwd: 'src/', src: ['data/*.json'], dest: 'dist/', ext: '.min.json'}
                ]
            }
        },
        watch: {
            styles: {
                // We watch and compile sass files as normal but don't live reload here
                files: ['src/sass/*.scss'],
                tasks: ['sass'],
            },
            scripts: {
                files: ['src/js/*.js'],
                tasks: ['uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-jsonmin');

    grunt.registerTask('default', ['sass', 'uglify', 'htmlmin', 'jsonmin', 'copy']);
};