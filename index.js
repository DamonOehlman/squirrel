var async = require('async'),
    debug = require('debug')('squirrel'),
    pkginfo = require('pkginfo')(module.parent, 'optionalDependencies'),
    read = require('read'),
    exec = require('child_process').exec,
    _ = require('underscore'),
    reCannotFind = /^cannot\sfind/i,
    reRelative = /^\./;
    
function invoke(command, opts) {
    // generate the command
    var commandTemplate = _.template(opts[command + 'Command'] || '');

    return function(target, callback) {
        var cmdline = commandTemplate({
                opts: opts,
                target: target,
                version: (pkginfo.optionalDependencies || {})[target] || 'latest'
            });

        debug('invoking: ' + cmdline);
        exec(cmdline, { cwd: opts.cwd }, callback);
    };
}

function squirrel(targets, opts, callback) {
    
    function requireModule(target, itemCallback, attemptCount) {
        var mod, err, shouldInstall = false;
        
        // initialise the attempt count to 0
        attemptCount = attemptCount || 0;
        debug('attempting to require: ' + target);
        
        // attempt to require the module in a try catch
        try {
            mod = require(target);
        }
        catch (e) {
            debug('caught require exception: ', e);
            
            // check if the module load failed because it couldn't be found
            shouldInstall = (attemptCount < 1) && reCannotFind.test(e.message) && (! reRelative.test(target));
            
            // customize the error
            err = attemptCount > 0 ? new Error('Attempted installation and was unable to install module') : e;
        }
        
        if (shouldInstall) {
            // if we should install this module, do that now
            invoke('install', opts)(target, function(err) {
                if (err) {
                    itemCallback(err);
                }
                else {
                    requireModule(target, itemCallback, attemptCount + 1);
                }
            });
        }
        else {
            debug('module "' + target + '" required, result: ', typeof mod);
            itemCallback(err, mod);
            
        }
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

squirrel.rm = function(targets, opts, callback) {
    // ensure the targets is an array
    targets = [].concat(targets || []);
    
    // handle the no options specified case
    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }
    
    // initialise the opts
    opts = _.defaults(opts || {}, squirrel.defaults);
    
    // uninstall each of the specified targets
    async.forEach(targets, invoke('uninstall', opts), callback);
};

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
    installCommand: '<%= opts.installer %> install <%= target %>@<%= version %>',
    
    // uninstall command
    uninstallCommand: '<%= opts.installer %> rm <%= target %>',

    // specify the target output stream
    outputStream: process.stderr
};

// export squirrel
module.exports = squirrel;