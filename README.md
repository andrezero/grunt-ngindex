# grunt-ngindex [![Build Status: Linux](https://travis-ci.org/andrezero/grunt-ngindex.png?branch=master)](https://travis-ci.org/andrezero/grunt-ngindex)

> Compiles index.html files from templates.


## Getting Started

This plugin requires Grunt `~0.4.0`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the
[Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a
[Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

Install the plugin with this command:

```shell
npm install grunt-ngindex --save-dev
```

Add this line to your project's `Gruntfile.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-ngindex');
```

## The "ngindex" task

_Run this task with the `grunt distjs` command._

Task targets, files and options may be specified according to the grunt
[Configuring tasks](http://gruntjs.com/configuring-tasks) guide.


### Overview

This is a grunt multi-task that generates html files from templates, linking any number of js/css files and
interpolating arbitrary vars.

It was built with [AngularJS](http://angularjs.org/) in mind and inspired by [ngbp](http://github.com/ngbp/ngbp)
but it can probably be used in many other scenarios.

On top of that, an effort was made to streamline the process of generating multiple html files, to cater for apps that
are segmented in independent modules and/or have specific needs for different environments or platforms.


### Templating

Create one `index.html` file (or more). Following [ng-boilerplate](http://github.com/ngbp/ngbp) practices, the best
place to store your template(s) is `src/` but you may choose any directory as long as you configure the task
accordingly.

You can find a good starting point in `example/index.html` inside this plugin directory.

The template syntax is the underlying
[Grunt Template Process](http://gruntjs.com/api/grunt.template#grunt.template.process), which uses
[Lo dash templates](http://lodash.com/docs/#template).

```html
<!DOCTYPE html>
<html data-ng-app="exampleApp" data-ng-controller="appCtrl">
<head>
    <title><%= pkg.name %></title>
    <% if ('undefined' !== typeof cssFiles) { cssFiles.forEach( function ( file ) { %>
    <link rel="stylesheet" type="text/css" href="/<%= file %>" /><% }); } %>

</head>
<body>
    <header>
        <h1><%= pkg.name %></h1>
        <h2><%= foo.bar.baz %></h2>
    </header>

    <div class="view-container">
        <section data-ng-view="main" id="content"></section>
    </div>

    <% if ('undefined' !== typeof jsFiles) { jsFiles.forEach( function ( file ) { %>
    <script type="text/javascript" charset="utf-8" src="/<%= file %>"></script><% }); } %>

</body>
</html>
```

### Configuration

Inside your `Gruntfile.js` file add a section called `ngindex`.

This section defines the default options, and the different files you want to generate.

Each target generates a single 'index.html' from a specific template, linking to a set of `js` and `css` files.

```js
grunt.initConfig({

  ngindex: {

    options: {
      src: [
          'build/src/vendor/**/*.js',
          'build/src/lib/**/*.js'
      ],
      dest: 'build/',
      template: 'src/template.html',
      stripDir: 'build',
      vars: {
        pkg: grunt.file.readJSON('package.json')
      }
    },

    front: {
      src: [
          'src/front/**/*.js',
          'src/**/*.css'
      ],
      options {
        vars: {
          'foo': 'bar'
        }
      }
    },
    admin: {
      src: [
        'src/admin/**/*.js',
        'src/admin/**/*.*css'
      ]
    }
  }
}
```

### Disclaimer

This being my first Grunt task, my feature wishlist was not framed within the Grunt configuration paradigm. Meaning that
I built this _thinking outside the box_, a.k.a., as a total grunt noob.

- You will see below that some of the target options _EXTEND_ the the task options instead of _OVERRIDING_ them.
- Also, you can set a default `dest` in the task options which does not seem to be a common practice.

Once I figured these are not standard approaches, this is not how Grunt makes config available to a task when it's
executed in a target context, I still checked a million Grunt plugins for similar use cases and couldn't actually
find anything.

Yet, I find it very useful to be able to define a set of common `src` files and `vars` for all your index files and
then extend that with target specific values so I'm keeping this for now. Feel free to comment on this project's
[issues](http://github.com/andrezero/grunt-ngindex/issues).


### Gotchas

The `dest` property must be a string. If it is an array, Grunt will fail when attempting to write the index file.


### Options

_Note: the options declared per target will either _OVERRIDE_ (`template`, `dest` and `stripDir`) or _EXTEND_ (`src`
and `vars`) the ones defined in the `options` property. See below for more details on each option.


#### options.template

Type: `String`

Default: `'src/index.html'`

The path to the template file, relative to the project directory.


#### options.dest

Type: `String`

Default: `'build/index.html'`

The path to the destination file, relative to the project directory.


#### options.src

Type: `Array`

Default: `null`

List of `css` and `js` files to link to. You can use the powerful
[grunt files](http://gruntjs.com/configuring-tasks#files) here, including glob patterns and template substitution.

```javascript
config = {

  ngindex: {

    index: {
      src: [
        '<%= files.vendor_js %>',
        'src/**/*.js',
        'src/*/*.*css'
      ]
    }
  }
};
```

The `src` option defined per target will merge with the value of `src` specified in the task options. This allows you to
define a common set of files for all targets and then expand it per target.

_NOTE: order matters and the base set of files will always preceed the target ones._

_NOTE: duplicate files will always be removed._

_NOTE: foreach entry in `src` that uses wildcards, only files that actually exist (relative to the project root) at the
moment the task is executed  will make it into the template. If no wildcards are used the files are not checked so you
may be including files that don't exist. Open the generated file(s) in a browser and check for 404s._

#### options.vars

Type: `Object`

Default: `'{}'`

Any data you want to pass to the template. Ex:

```javascript
config = {

  ngindex: {

    options: {
      vars: {
        foo: { bar: 'baz' }
      }
    }
  }
};
```

You can then use it in your template like this:

```html
<span><%= foo.bar.baz %>/span>
```

The available data is always the result of deep extending any `vars` defined in the `options` property with any `vars`
defined per target.


#### options.stripDir

Type: `String|Array`

Default: `'build/'`

Strips the given prefix from the beginning of the paths of any matched files.

If your file list contains files inside the actual build folder, this will generate invalid links, since the app is
served from within the acual `build/` directory. Ex:

```javascript
files: ['build/vendor/**/*.js']
```

In this case, you will want to use `options.stripDir` to strip `build/` from every `css` and `js` file linked.

```javascript
config = {

  ngindex: {

    options: {
      stripDir: 'build/'
    }
  }
};
```

You can also specify more than one path to strip. Ex: `['build/', 'dist/']`.


---


## Roadmap

### Embedding css, javascript or arbitrary content in the template.

This will require another configuration option, a map that targets named regions in the template and defines the source
of the content, this being a file or an ordered list of files.

Here's an example use case, where we are embeding:
- css contents generated by a `less` task;
- the raw contents of another html file;
- the result of a [grunt-template](http://github.com/mathiasbynens/grunt-template) task that generates a costumized
Google Analytics script.

```javascript
config = {

  ngindex: {

    main: {
      src: [ ... ],
      options: {
        embed: {
          style: '<%= less.embed_css.dest %>',
          footer: '<%= files.html.production_footer %>',
          ga: '<%= ga_template.dest %>'
        }
      }
    }
  }
};
```

These vars would then be used in the templates like this:

```html
<head>
<% if ('undefined' !== typeof embed.embed) { %><style><%= embed.style %></style><% } %>
...

</head>
<body>
<% if ('undefined' !== typeof embed.footer) { %><%= embed.footer %><% } %>

...

<% if ('undefined' !== typeof embed.ga) { %>
    <script type="text/javascript" charset="utf-8">
    <%= embed.ga %>
    </script>
<% } %>

</body>
```

## Roadmap

- test coverage for all configuration options


## Credits and Acknowlegdments

All credits go to the [ngbp](http://github.com/ngbp/ngbp) project for seeding an `index` task in the boilerplate.


## [MIT License](LICENSE-MIT)

[Copyright (c) 2014 Andre Torgal](http://andrezero.mit-license.org/2014)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
