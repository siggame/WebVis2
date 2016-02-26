module.exports = function(grunt) {
    require('jit-grunt')(grunt);
    var serveStatic = require('serve-static');
    grunt.loadNpmTasks('grunt-processhtml');

    grunt.initConfig({
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {livereload: true},
                files: [
                    "app/{,*/}*.html",
                    "app/styles/{,*/}*.css",
                    "app/scripts/{,*/}*.js",
                    "app/plugins/{,*/}*.*",
                    "app/images/{,*/}*.{png, jpg, jpeg, gif, webp, svg}"
                ]
            }
        },

        connect: {
            all: {
                options: {
                    port: 9000,
                    hostname: "localhost",
                    livereload: 35729,
                    base: 'app',
                    open: true,
                    middleware: function(connect) {
                        return [
                            serveStatic('app'),
                            connect().use(
                                '/bower_components',
                                serveStatic('./bower_components')
                            )
                        ];
                    }
                }
            }
        },

        wiredep: {
            all: {
                src: [
                    'app/*.html',
                    'app/view/*.html'
                ],
                options: {
                    ignorePath: /\.\.\//
                },
                src: ['app/index.html']
            }
        },

        processhtml: {

            dist: {
              files: {
                'app/index.html': ['app/index.html']
              }
            }
        },
    });

    grunt.registerTask('default', function(target) {
        grunt.task.run(['serve']);
    });

    grunt.registerTask('build', [
        'wiredep',
    ]);

    grunt.registerTask('serve', [
        'wiredep',
        'connect',
        'watch'
    ]);

    grunt.registerTask('dist', [
        'wiredep'
    ]);
};
