const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Volume     = require('./../Volume');

const expect = chai.expect;
chai.use(sinonChai);


describe('Volume testing', () => {
    describe('Parser and to string', () => {
        it('Parse without mapping', () => {
            const path = '/var/lib/mysql';
            const volume = Volume.parseVolume(path);
            expect(volume.target).to.be.equal('/var/lib/mysql');
            expect(volume.source).to.be.equal(undefined);
            expect(volume.accessMode).to.be.equal(undefined);
            expect(volume.toString()).to.be.equal(path);
        });

        it('Parse with mapping', () => {
            const path = '/opt/data:/var/lib/mysql';
            const volume = Volume.parseVolume(path);
            expect(volume.target).to.be.equal('/var/lib/mysql');
            expect(volume.source).to.be.equal('/opt/data');
            expect(volume.accessMode).to.be.equal(undefined);
            expect(volume.toString()).to.be.equal(path);
        });


        it('Parse with mapping and access mode', () => {
            const path = '~/configs:/etc/configs/:ro';
            const volume = Volume.parseVolume(path);
            expect(volume.target).to.be.equal('/etc/configs/');
            expect(volume.source).to.be.equal('~/configs');
            expect(volume.accessMode).to.be.equal('ro');
            expect(volume.toString()).to.be.equal(path);
        });


    });
});

