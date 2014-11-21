var squirrel = require('../'),
    expect = require('expect.js'),
    exec = require('child_process').exec;

describe('remove module tests', function() {
    before(function(done) {
        squirrel('nopt', done);
    });

    it('should successfully uninstall a module', function(done) {
        squirrel.rm('nopt', function() {
            exec("npm list", function(err, stdout) {
                expect(stdout).not.to.contain('nopt');
                done(err);
            })
        })
    });
});
