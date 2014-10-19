'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var config = {

        clean: {

            tests: ['tmp'],
        },

        jshint: {

            options: {
                jshintrc: '.jshintrc',
            },

            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>',
            ]
        },

        jsbeautifier: {

            options: {
                config: '.jsbeautifyrc'
            },

            modify: {
                src: [
                    'Gruntfile.js',
                    'tasks/*.js',
                    '<%= nodeunit.tests %>',
                ]
            },

            verify: {
                src: [
                    'Gruntfile.js',
                    'tasks/*.js',
                    '<%= nodeunit.tests %>',
                ],
                options: {
                    mode: 'VERIFY_ONLY'
                }
            }
        },

        ngindex: {

            options: {

                // these will be overriden
                dest: 'tmp/foo.html',
                stripDir: 'build/',
                template: 'test/foo.html',
                // these will be merged
                src: [
                    'test/fixtures/*css',
                ],
                // these will be deep merged
                vars: {
                    foo: {
                        baz: 'qux'
                    }
                }
            },

            test: {

                src: [
                    'test/fixtures/*.js',
                ],
                dest: 'tmp/test1.html',
                options: {
                    stripDir: 'test/',
                    template: 'test/fixtures/test1.html',
                    vars: {
                        pkg: '<%= pkg %>',
                        foo: {
                            bar: 'baz'
                        }
                    }
                }
            }
        },

        nodeunit: {

            tests: ['test/*_test.js'],
        }
    };

    // inject `package.json` into config to test "pkg" interpolation in template
    grunt.util._.merge(config, {
        pkg: grunt.file.readJSON('./package.json')
    });

    // Project configuration.
    grunt.initConfig(config);

    // load this plugin's task(s).
    grunt.loadTasks('tasks');

    // these plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'ngindex:test', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'jsbeautifier', 'test']);

};

