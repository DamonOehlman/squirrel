var squirrel = require('../'),
    expect = require('expect.js');

describe('deny installation tests', function() {
    before(function(done) {
        // initialise the squirrel options to allow installation
        squirrel.defaults.allowInstall = false;
        
        squirrel.rm(['nopt', 'matchme'], done);
    });
    
    afterEach(function(done) {
        squirrel.rm(['nopt', 'matchme', 'coffee-script', 'jade'], done);
    });
    
    it('should be able to install nopt', function(done) {
        squirrel('nopt', function(err, nopt) {
            expect(err).to.be.ok();
            expect(err.message).to.contain('not permitted');
            done();
        });
    });
    
    it('should be able to deal with both installed and uninstalled modules', function(done) {
        squirrel(['debug', 'nopt'], function(err, debug, nopt) {
            expect(err).to.be.ok();
            expect(err.message).to.contain('not permitted');
            done();
        });
    });
    
    it('should be able to install multiple modules', function(done) {
        squirrel(['nopt', 'matchme'], function(err, nopt, matchme) {
            expect(err).to.be.ok();
            expect(err.message).to.contain('not permitted');
            done();
        });
    });
    
    it('should be able to install the demo dependencies', function(done) {
        squirrel(['coffee-script', 'jade'], function(err, coffee, jade) {
            expect(err).to.be.ok();
            expect(err.message).to.contain('not permitted');
            done();
        });
    });
});