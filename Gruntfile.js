module.exports = function (grunt) {
    'use strict';

    /**
     * read optional JSON from filepath
     * @param {String} filepath
     * @return {Object}
     */
    var readOptionalJSON = function (filepath) {
        var data = {};
        try {
            data = grunt.file.readJSON(filepath);
            // The concatenated file won't pass onevar
            // But our modules can
            delete data.onever;
        } catch (e) {}
        return data;
    };

    grunt.initConfig({
        // package File
        pkg: grunt.file.readJSON('package.json'),

        // bulid source(grunt-build.js).
        build: {
            all: {
                baseUrl: 'src/js', // base url
                startFile: 'intro.js', // intro part
                endFile: 'outro.js', // outro part
                outFile: 'dist/sunnynote.js' // out file
            }
        },

        // for javascript convention.
        jshint: {
            all: {
                src: [
                    'src/**/*.js',
                    'Gruntfile.js',
                    'test/**/*.js'
                ],
                options: {
                    jshintrc: true
                }
            },
            dist: {
                src: 'dist/sunnynote.js',
                options: readOptionalJSON('.jshintrc')
            }
        },

        // qunit: javascript unit test.
        qunit: {
            all: ['test/*.html']
        },

        // uglify: minify javascript
        uglify: {
            all: {
                files: {
                    'dist/sunnynote.min.js': ['dist/sunnynote.js']
                }
            }
        },

        // compress: sunnynote-{{version}}-dist.zip
        compress: {
            main: {
                options: {
                    archive: function () {
                        return 'dist/sunnynote-{{version}}-dist.zip'.replace(
                            '{{version}}',
                            grunt.config('pkg.version')
                        );
                    }
                },
                files: [{
                    expand: true,
                    src: [
                        'dist/*.js'
                    ]
                }, {
                    src: ['plugin/*.js'],
                    dest: 'dist/'
                }]
            }
        },

        // connect configuration.
        connect: {
            all: {
                options: {
                    port: 3000,
                    //livereload: true,
                    middleware: function (connect, options, middlewares) {
                        var base = options.base[0];

                        middlewares = middlewares || [];
                        middlewares.concat([
                            connect['static'](base), // serve static files
                            connect.directory(base) // make empty directories browsable
                        ]);

                        middlewares.unshift(function (req, res, next) {
                            res.setHeader('Content-Security-Policy', 'default-src \'self\';');
                            next();
                        });

                        return middlewares;
                    },
                    open: 'http://localhost:3000/examples'
                }
            }
        },

        // watch source code change
        watch: {
            all: {
                files: ['src/js/**/*.js'],
                tasks: ['jshint', 'qunit']
            }
        }

    });

    // load all tasks from the grunt plugins used in this file
    require('load-grunt-tasks')(grunt);

    // load all grunts/*.js
    grunt.loadTasks('grunts');

    // server: runt server for development
    grunt.registerTask('server', ['connect', 'watch']);

    // test: unit test on test folder
    grunt.registerTask('test', ['jshint', 'qunit']);

    // dist: make dist files
    grunt.registerTask('dist', ['build', 'test', 'uglify']);

    // deploy: compress dist files
    grunt.registerTask('deploy', ['dist', 'compress']);

    // default: server
    grunt.registerTask('default', ['server']);

};