const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Volume     = require('./../Volume');

const expect = chai.expect;
chai.use(sinonChai);


describe('Volume testing', () => {
    describe('Parser', () => {
        it('Parse without mapping', () => {
            const volume = Volume.parseVolume('/var/lib/mysql');
            expect(volume.target).to.be.equal('/var/lib/mysql');
            expect(volume.source).to.be.equal(undefined);
        });

        it('Parse with mapping', () => {
            const volume = Volume.parseVolume('/opt/data:/var/lib/mysql');
            expect(volume.target).to.be.equal('/var/lib/mysql');
            expect(volume.source).to.be.equal(undefined);
        });
    });
});

