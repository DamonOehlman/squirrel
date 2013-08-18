# squirrel

Squirrel is a helpful node module that assists you requiring your
dependencies for plugins of your application (version controlled via a
custom `pluginDependencies` in your `package.json` file).


[![NPM](https://nodei.co/npm/squirrel.png)](https://nodei.co/npm/squirrel/)

[![Build Status](https://travis-ci.org/DamonOehlman/squirrel.png?branch=master)](https://travis-ci.org/DamonOehlman/squirrel)
[![unstable](http://hughsk.github.io/stability-badges/dist/unstable.svg)](http://github.com/hughsk/stability-badges)

## Why Squirrel?

Because personally, I really don't like the sitting waiting for a node
package to install a whole swag of dependencies because it requires them
for some functionality that I don't intend to use.  I believe using
squirrel will enable certain types of packages to have a leaner core
with properly managed and installable optional dependencies.

## Example Usage

If you are using `optionalDependencies` in your application, you might
consider using `pluginDependencies` instead and then "squirreling"
them rather than requiring them.

__NOTE:__ Squirreling is an asynchronous operation:

```js
var squirrel = require('squirrel');

squirrel('coffee-script', function(err, coffee) {
  // do something magical with coffeescript...
});
```

If you need multiple modules, then squirrel is happy to play in a 
way similar to the way AMD module loaders do:

```js
squirrel(['coffee-script', 'jade'], function(err, coffee, jade) {
  // do something with both coffeescript and jade...
});
```

## Squirrel Options

A squirrel's got to have options.  The demands on the modern squirrel
mean that having options is important, and this squirrel is not different.
Here are the options that squirrel supports in a 2nd (optional) argument.

```js
// initialise the squirrel defaults
squirrel.defaults = {
  // whether or not the interactive process that will allow the user to
  // request the package will be installed or not
  allowInstall: false,
  
  // initialise the prompt message
  promptMessage: 'Package "<%= target %>" is required. Permit install? ',
  
  // the current working directory in which npm will be run to install
  // the package, defaults to the directory the squirrel parent
  // package.json is located in
  cwd: basePath, 
  
  // the path to the installer, by default we are hoping
  // `npm` will exist in the PATH
  installer: 'npm',
  
  // install command
  installCommand: '<%= opts.installer %> install <%= target %>@<%= version %>',
  
  // uninstall command
  uninstallCommand: '<%= opts.installer %> rm <%= target %>'
};
```

The default options can be modified through modifying them in
the `squirrel.defaults` object.

## Shouldn't Squirrel be dependency free?

You could argue that given squirrel's mission is to reduce the overall
number of package dependencies, it should be ultralight in it's own
packaging.  While that's a valid point, I think a balance is required and
using existing well-tested libraries is important.

## Reference

### squirrel(targets, opts?, callback)

Request the installation of the modules specified in the `targets` array
argument.

### squirrel.rm(targets, opts, callback)

Remove the specified targets.  Used in squirrel tests and I guess in some
cases might be useful in production code also.

## Squirrel Installer Reference

This module constains the installer helper functions used within squirrel.
Each of the functions outlined below is designed to be called initially
with an options object, which then provides you the function signature
outlined in the docs.

```js
var installer = require('squirrel/installer');
```

### install(target, callback)

Use npm to install the required target.

### prepare(target, callback)

This is the first step called in the pull-stream when squirrel is asked
for particular modules.  It will determine what action is required based
on what has been asked for, depending on a number of factors:

- whether the module requested is relative (i.e. starts with a dot)
- what our allowed install options (prompt, always, never, etc)
- whether the module is already available or not

### remove(target, callback)

Execute the required installer operation
