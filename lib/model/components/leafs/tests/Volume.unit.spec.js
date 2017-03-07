const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Volume     = require('./../Volume');
const policies  = require('./../../../policies');

const expect = chai.expect;
chai.use(sinonChai);


describe('Volume testing', () => {
    describe('Parser and to string', () => {

        it('Parse without mapping', () => {
            const path = '/var/lib/mysql';
            const volume = Volume.parse(path);
            expect(volume.target).to.be.equal('/var/lib/mysql');
            expect(volume.source).to.be.equal(undefined);
            expect(volume.accessMode).to.be.equal(undefined);
            expect(volume.toString()).to.be.equal(path);
        });

        it('Parse with mapping', () => {
            const path = '/opt/data:/var/lib/mysql';
            const volume = Volume.parse(path);
            expect(volume.target).to.be.equal('/var/lib/mysql');
            expect(volume.source).to.be.equal('/opt/data');
            expect(volume.accessMode).to.be.equal(undefined);
            expect(volume.toString()).to.be.equal(path);
        });

        it('Parse with mapping and access mode', () => {
            const path = '~/configs:/etc/configs/:ro';
            const volume = Volume.parse(path);
            expect(volume.target).to.be.equal('/etc/configs/');
            expect(volume.source).to.be.equal('~/configs');
            expect(volume.accessMode).to.be.equal('ro');
            expect(volume.toString()).to.be.equal(path);
        });


    });

    describe('Warnings', () => {
        it('Get all', () => {
            const path = '/opt/data:/var/lib/mysql';
            const volume = Volume.parse(path);
            expect(volume.getWarnings(policies.shared.services['volumes'])).to.be.deep.equal([
                {
                    "actual": "/opt/data:/var/lib/mysql",
                    "autoFix": false,
                    "message": undefined,
                    "name": "NO_PERMISSION",
                    "requireManuallyFix": true,
                    "suggestion": "/var/lib/mysql"
                }
            ]);
        });

    });
});

