var squirrel = require('../'),
    expect = require('expect.js');

describe('installable module tests', function() {
    before(function(done) {
        squirrel.rm(['nopt', 'matchme'], done);
    });
    
    afterEach(function(done) {
        squirrel.rm(['nopt', 'matchme'], done);
    });
    
    it('should be able to install nopt', function(done) {
        squirrel('nopt', function(err, nopt) {
            expect(nopt).to.be.ok();
            done(err);
        });
    });
    
    it('should be able to deal with both installed and uninstalled modules', function(done) {
        squirrel(['debug', 'nopt'], function(err, debug, nopt) {
            expect(debug).to.be.ok();
            expect(nopt).to.be.ok();
            done(err);
        });
    });
    
    it('should be able to install multiple modules', function(done) {
        squirrel(['nopt', 'matchme'], function(err, nopt, matchme) {
            expect(nopt).to.be.ok();
            expect(matchme).to.be.ok();
            done(err);
        });
    });
});