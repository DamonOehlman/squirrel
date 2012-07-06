var squirrel = require('../'),
    expect = require('expect.js');
    
describe('require existing modules check', function() {
    it('should be able to successfully include a module that exists already', function(done) {
        squirrel('read', function(err, read) {
            expect(read).to.be.ok();
            done(err);
        });
    });
    
    it('should be able to include multiple modules in a single call', function(done) {
        squirrel(['read', 'pkginfo'], function(err, read, pkginfo) {
            expect(read).to.be.ok();
            expect(pkginfo).to.be.ok();
            done(err);
        });
    });
});