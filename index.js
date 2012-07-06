var async = require('async'),
    pkginfo = require('pkginfo')(module.parent),
    read = require('read'),
    _ = require('underscore');

function squirrel(targets, opts, callback) {
    
    function requireModule(target, itemCallback) {
        var mod;
        
        // attempt to require the module in a try catch
        try {
            mod = require(target);
        }
        catch (e) {
            // we could not load the module so it's time to invoke plan b
            console.log(e);
        }
        
        itemCallback(null, mod);
    }
    
    // ensure the targets is an array
    targets = [].concat(targets || []);
    
    // handle the no options specified case
    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }
    
    // initialise the opts
    opts = _.defaults(opts || {}, squirrel.defaults);
    
    // get each of the requested modules
    async.mapSeries(targets, requireModule, function(err, modules) {
        callback.apply(null, [err].concat(modules));
    });
}

// initialise the squirrel defaults
squirrel.defaults = {
    // whether or not the interactive process that will allow the user to request 
    // the package will be installed or not
    allowInstall: false,
    
    // the current working directory in which npm will be run to install the package
    cwd: process.cwd(),
    
    // the path to the installer, by default we are hoping `npm` will exist in the PATH
    installer: 'npm',
    
    // install command
    installCommand: '<%= opts.installer %> install <!= package =>@<!= version =>',

    // specify the target output stream
    outputStream: process.stderr
};

// export squirrel
module.exports = squirrel;