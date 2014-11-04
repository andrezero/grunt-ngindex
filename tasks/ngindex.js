'use strict';

var path = require('path');
var util = require('util');
var _ = require('lodash');

module.exports = function (grunt) {

    /**
     * specifically for normalizing this.filesSrc AND options.src, makes sure data is an array
     *
     * - if it is undefined or null, default to empty []
     * - if it is a string, convert to array
     * - if it is an array keep it, every thing else, ignore it
     *
     * @param {mixed} data
     * @returns {array}
     */
    function ensureArray(data) {
        data = ('undefined' === typeof data) ? [] : data;
        data = ('string' === typeof data) ? [data] : data;
        data = (data && 'object' === typeof data && 'function' === typeof data.join) ? data : [];
        // weird case where target has no 'src' property and Grunt set `this.filesSrc` to [undefined]
        if (data.length === 1 && 'undefined' === typeof data[0]) {
            data = [];
        }
        return data;
    }

    grunt.registerMultiTask('ngindex', 'Generate index.html', function () {

        // task/target options
        // not setting defaults here to allow extending `options.vars` instead of overriding it
        var targetOptions = this.options();

        // target vars deep extend task options
        var baseOptions = grunt.config(this.name + '.options');
        var extendableOptions = {
            vars: baseOptions.vars || {},
            dest: baseOptions.dest
        };

        // manually override with deep extend
        // defaults > task options > target options
        var defaults = {
            template: 'src/index.html'
        };
        var opts = _.merge(defaults, extendableOptions, targetOptions);

        // manually extend task options.src with target filesSrc
        // merge options.files with data.filesSrc to create a flatten and unique file list
        var files = grunt.file.expand(ensureArray(opts.src));
        files = _(files).chain().concat(ensureArray(this.filesSrc)).flatten().uniq().value();

        // manually override dest
        opts.dest = this.data.dest || opts.dest;

        // make sure that stripDir is an array
        opts.stripDir = ensureArray(opts.stripDir);
        // set default
        if (!opts.stripDir.length) {
            opts.stripDir = ['build/'];
        }

        // base paths to strip from all css/js files
        // typically "build/" and/or "dist/" are stripped because index files are served from these directories
        if (opts.stripDir) {
            var stripDirectoriesRegExp = new RegExp('^(' + opts.stripDir + ')', 'g');
            files = files.map(function (file) {
                return file.replace(stripDirectoriesRegExp, '');
            });
        }

        // separate js/css files
        var jsFiles = files.filter(function (file) {
            return file.match(/\.js$/);
        });
        var cssFiles = files.filter(function (file) {
            return file.match(/\.css$/);
        });

        // data availabe in templates
        var data = {};

        /**
         * @param {object} data
         */
        function addHelpers(data) {

            var basePath = path.dirname(opts.template);

            /**
             * @param {string} fileName
             */
            data.partial = function (fileName, overrideData) {
                grunt.verbose.writeln('+ render partial', fileName);
                var template = grunt.file.read(path.join(basePath, fileName));
                var partialData = _.clone(data, true);
                _.extend(partialData, overrideData);
                var html = grunt.template.process(template, {
                    data: partialData
                });
                return html;
            };
        }

        // - data passed in options.vars
        _.merge(data, opts.vars || {});
        // - template helpers
        addHelpers(data);
        // - js and css files retrieved from target files
        data.jsFiles = jsFiles;
        data.cssFiles = cssFiles;

        if (grunt.option('debug')) {
            console.log(data);
        }

        // copy the template to the target dir and process it
        grunt.file.copy(opts.template, opts.dest, {
            process: function (contents, path) {
                var html = grunt.template.process(contents, {
                    data: data
                });
                grunt.verbose.write('length: ' + html.length + '...');
                return html;
            }
        });

        grunt.verbose.ok();
    });

};

