# squirrel

Squirrel is a helpful node module that assists you requiring your  [optionalDependencies](http://npmjs.org/doc/json.html#optionalDependencies) into your application for runtime use rather than using [dependencies](http://npmjs.org/doc/json.html#dependencies).

## Why Squirrel?

Because personally, I really don't like the sitting waiting for a node package to install a whole swag of dependencies because it requires them for some functionality that I don't intend to use.  I believe using squirrel will enable certain types of packages to have a leaner core with properly managed and installable optional dependencies.

## Exmaple Usage

If you are using `optionalDependencies` in your application try "squirreling" them rather than requiring them.  (__NOTE:__ Squirreling is an asynchronous operation):

```js
var squirrel = require('squirrel');

squirrel('coffee-script', function(err, coffee) {
    // do something magical with coffeescript...
});
```

If you need multiple modules, then squirrel is happy to play in a way similar to the way AMD module loaders do:

```js
squirrel(['coffee-script', 'jade'], function(err, coffee, jade) {
    // do something with both coffeescript and jade...
});
```

## Squirrel Options

A squirrel's got to have options.  The demands on the modern squirrel mean that having options is important, and this squirrel is not different.  Here are the options that squirrel supports in a 2nd (optional) argument:

- allowInstall (default: false) - whether or not the user should be able to install the requested package on demand.  This is disabled by default to protect against console prompting when using squirrel in web application environments.


The default options can be modified through modifying them in the `squirrel.defaults` object.

## Shouldn't Squirrel be dependency free?

You could argue that given squirrel's mission is to reduce the overall number of package dependencies, it should be ultralight in it's own packaging.  While that's a valid point, I think a balance is required and using existing well-tested libraries is important.
