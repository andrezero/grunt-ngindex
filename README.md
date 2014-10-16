# grunt-ngindex

> Compiles index.html files from templates.


## Getting Started

This plugin requires Grunt `~0.4.0`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the
[Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a
[Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

1. Install the plugin with this command:

```shell
npm install grunt-ngindex --save-dev
```

2. Add this line to your project's `Gruntfile.js` gruntfile:

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


### Templating

Create one `index.html` file (or more). Following [ng-boilerplate](http://github.com/ngbp/ngbp) practices, the best
place to store your template(s) is `src/` but you may choose any directory as long as you configure the task
accordingly.

You can find a good starting point in `example/index.html` inside this plugin directory (it will typically be installed
in `node_modules/grunt-ngindex`).

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

### Configration

Inside your `Gruntfile.js` file add a section called `ngindex`. This section specifies the targets for the `ngindex`
task and the options you want to pass to each target.

Each target generates a single 'index.html' from a specfific template and links to a set of `js` and `css` files.

Configure the plugin to collect `js` an `css` files and generate `build/index.html` from the template.

```js
grunt.initConfig({

  ngindex: {

    index: {
      src: [
        'src/**/*.js',
        'src/*/*.*css'
      ]
    }
  }
}
```

If you need to generate more than one file you can add multiple targets to your `Gruntfile`. This is typically the
case if your app is segmented and/or if you have different build targets for different environments or platforms.

```js
grunt.initConfig({

  ngindex: {

    index_dist: {
      stripDir: 'dist',
      target: 'dist/index_front.html',
      src: [
          'src/front/**/*.js',
          'src/**/*.css'
      ],
      vars: {
        'foo': 'bar'
      }
    },
    index_build: { ... }
  }
}
```

Once you have more than one target you may want to use the `options` property property to set defaults and avoid repetion.

```js
grunt.initConfig({

  ngindex: {

    options: {
      template: 'src/template.html',
      stripDir: 'build/',
      src: [
        'vendor/**/*.js'
      ],
      vars: {
        foo: 'bar'
      }
    },

    build: {
      stripDir: [... more paths ...],
      src: [... more files ... ],
      vars: { ... more vars ... }
    }
  }
}
```

### Disclaimer

This being my first Grunt task, my feature wishlist was not framed within the Grunt configuration paradigm.

You will see below that some of the target options _EXTEND_ the the task options instead of _OVERRIDING_ then. Once I
figured this not how Grunt makes config available to a task executing a target, I checked a million Grunt plugins
on npm and couldn't find any examples of a similar use case.

I still find it very useful to be able to define a set of common `src` files and `vars` for all your index files and
then extend that with target specific values so I'm keeping this for now. Feel free to comment on this project GitHub
[issues](http://github.com/andrezero/grunt-ngindex/issues).


### Gotchas

The `dest` property must be a string. If it is an array, Grunt will fail when attempting to write the index file.


### Options

_Note: the options declared per target will either _OVERRIDE_ (`template`, `dest` and `stripDir`) or _EXTEND_ (`src`
and `vars`) the ones defined in the `options` property. See below for more details on each option behaviour.


#### options.template
Type: `String`
Default value: `'src/index.html'`

The path to the template file, relative to the project directory.

If set in the `options` property, any target that also defines it will override its value.


#### options.dest
Type: `String`
Default value: `'build/index.html'`

The path to the destination file, relative to the project directory.

If set in the `options` property, any target that also defines it will override its value.


#### options.src
Type: `Array`
Default value: `null`

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
moment the task is executed  will actually make it into the template. If no wildcards are used the files are not checked
so you may actually be including files that don't exist. To make sure, you can open the generated file in a browser and
check for 404_

#### options.vars
Type: `Object`
Default value: `'{}'`

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
Default value: `'build/'`

Strips the given prefix from the start of the

If your list of file contains files inside the actual build folder, this will generate invalid links, since the app is
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

You can also specify more than one, ex: `['build/', 'dist/']`.

If set in the `options` property, any target that also defines it will override its value.

## Future Development

I plan to soon release an upgrade to enables embedding css, javascript or arbitrary content in the template. This
will require another configuration option, a map that targets named regions in the template and defines the source of
the content, this being a file or an ordered list of files.

In this example, we embed:
- the result of a `less` dist task that generates a stylesheet;
- the raw contents of another html file;
- the result of yet another `ngindex` tasks that costumizes a Google Analytics script.

```javascript
config = {

  ngindex: {

    main: {
      src: [ ... ],
      options: {
        embed: {
          style: '<%= less.embed_css.dest %>',
          footer: '<%= files.html.production_footer %>',
          ga: '<%= ngindex.ga_template.dest %>'
        }
      }
    }
  }
};
```

This can then be used in the templates like this:

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

---


## Roadmap

Integrate with a `serve` task.


## Credits and Acknowlegdments

All credits go to the [ngbp](http://github.com/ngbp/ngbp) project for seeding an `index` task in the boilerplate.
