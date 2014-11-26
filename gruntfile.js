module.exports = function(grunt){
    
    grunt.initConfig({
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'css/main.css': 'sass/main.scss',
                }
            }
        },
        remfallback: {
            dist: {
                files: {
                    'css/main.css': ['css/main.css']
                }
            }
        },
        watch: {
            files: ['sass/**'],
            tasks: ['sass', 'remfallback']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-remfallback');
    
    grunt.registerTask('default', ['watch']);
};