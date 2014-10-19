'use strict';

var util = require('util');
var _ = require('loadash');

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
        data = (data && 'object' === typeof data && 'function' === typeof data.join) ? data : []
        // weird case where target has no 'src' property and Grunt set `this.filesSrc` to [undefined]
        if (data.length === 1 && 'undefined' === typeof data[0]) {
            data = [];
        }
        return data;
    }

    grunt.registerMultiTask('ngindex', 'Generate index.html', function () {

        // task/target options
        // not setting defaults here to allow extending `options.vars` instead of override
        var targetOptions = this.options();

        // target vars deep extend task options
        var baseOptions = grunt.config(this.name + '.options');
        var extendableOptions = {
            vars: baseOptions.vars || {},
            dest: baseOptions.dest
        }

        // manually override with deep extend
        // defaults > task options > target options
        var defaults = {
            template: 'src/index.html'
        };
        var options = _.merge(defaults, extendableOptions, targetOptions);

        // manually extend task options.src with target filesSrc
        // merge options.files with data.filesSrc to create a flatten and unique file list
        var files = grunt.file.expand(ensureArray(options.src));
        files = _(files).chain().concat(ensureArray(this.filesSrc)).flatten().uniq().value();

        // manually override dest
        options.dest = this.data.dest || options.dest;

        // make sure that stripDir is an array
        options.stripDir = ensureArray(options.stripDir);
        // set default
        if (!options.stripDir.length) {
            options.stripDir = ['build/'];
        }

        // base paths to strip from all css/js files
        // typically "build/" and/or "dist/" are stripped because index files are served from these directories
        if (options.stripDir) {
            var stripDirectoriesRegExp = new RegExp('^(' + options.stripDir + ')', 'g');
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
        var data = {
            jsFiles: jsFiles,
            cssFiles: cssFiles
        };
        _.merge(data, options.vars || {});

        // copy the template to the target dir and process it
        grunt.file.copy(options.template, options.dest, {
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
