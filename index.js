var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    debug = require('debug')('squirrel'),
    read = require('read'),
    exec = require('child_process').exec,
    _ = require('underscore'),
    errNotPermitted = new Error('Installation not permitted'),
    basePath,
    reCannotFind = /^cannot\sfind/i,
    reRelative = /^\./,
    _existsSync = fs.existsSync || path.existsSync,
    cachedVersions;
    
function allowInstall(target, opts, callback) {
    var notPermitted = '';
    
    if (! opts.allowInstall) {
        callback(errNotPermitted);
    }
    else if (opts.allowInstall === 'prompt') {
        var template = _.template(opts.promptMessage),
            readOpts = {
                prompt: template({ target: target, opts: opts }),
                'default': 'Y'
            };
        
        read(readOpts, function(err, result) {
            var proceed = (! err) && (result || '').toLowerCase().slice(0, 1) === 'y';

            callback(proceed ? null : errNotPermitted);
        });
    }
    else {
        callback();
    }
}

function invoke(command, opts) {
    // generate the command
    var commandTemplate = _.template(opts[command + 'Command'] || '');

    return function(target, callback) {
        var cmdline = commandTemplate({
                opts: opts,
                target: target,
                version: squirrel.versions[target] || 'latest'
            }),
            npmProcess = exec(cmdline, { cwd: opts.cwd }, callback);

        // if we are in prompt mode, pass through stdout and err from npm
        if (opts.allowInstall == 'prompt') {
            npmProcess.stdout.pipe(process.stdout);
            npmProcess.stderr.pipe(process.stderr);
        }
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
            var actions = [
                    allowInstall.bind(null, target, opts),
                    invoke('install', opts).bind(null, target)
                ];
            
            // iterate through the actions
            async.series(actions, function(err) {
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


// find the basepath
basePath = path.dirname(path.dirname(module.filename));

(function() {
    var lastPath = '', packageData = {};

    while (basePath !== lastPath && (! _existsSync(path.join(basePath, 'package.json')))) {
        lastPath = basePath;
        basePath = path.dirname(basePath);
    }
    
    try {
        // read the package 
        packageData = require(path.join(basePath, 'package.json'));
    }
    catch (e) {
        // could not find package.json in the expected spot, so default the basepath to the cwd
        // reset the basepath to the cwd
        basePath = process.cwd();
    }
    
    squirrel.versions = packageData.pluginDependencies || {};
}());

// initialise the squirrel defaults
squirrel.defaults = {
    // whether or not the interactive process that will allow the user to request 
    // the package will be installed or not
    allowInstall: false,
    
    // initialise the prompt message
    promptMessage: 'Package "<%= target %>" is required. Permit installation? ',
    
    // the current working directory in which npm will be run to install the package
    cwd: basePath,
    
    // the path to the installer, by default we are hoping `npm` will exist in the PATH
    installer: 'npm',
    
    // install command
    installCommand: '<%= opts.installer %> install <%= target %>@<%= version %>',
    
    // uninstall command
    uninstallCommand: '<%= opts.installer %> rm <%= target %>'
};

// export squirrel
module.exports = squirrel;