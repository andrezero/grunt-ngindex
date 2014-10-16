'use strict';

var grunt = require('grunt');

var assertFileContentsEqual = function(test, actualFile, expectedFile, message) {

  var actual = grunt.file.read(actualFile);
  var expected = grunt.util.normalizelf(grunt.file.read(expectedFile));
  test.equal(actual, expected, message);
};

exports.html2js = {

  setUp: function(done) {
    // setup here if necessary
    done();
  },

  regex_in_template: function(test) {

    test.expect(1);

    assertFileContentsEqual(test, 'tmp/test1.html',
          'test/expected/test1.html',
          'expected compiled index');

    test.done();
  }
};
