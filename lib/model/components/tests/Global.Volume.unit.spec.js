'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Volume    = require('../volume/Volume');

const expect = chai.expect;
chai.use(sinonChai);


describe('Global Volume testing', () => {
    describe('Basic properties', () => {

        it('Parse without mapping', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            expect(volume.getName()).to.be.equal(name);
        });

    });

    describe('Basic driver', () => {

        it('Get empty driver', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            expect(volume.getDriver()).to.be.equal(undefined);
        });

        it('Set  driver', () => {
            const name      = 'my-volume';
            const volume    = new Volume(name);
            const newDriver = 'driver';
            volume.setDriver(newDriver);
            expect(volume.getDriver()).to.be.equal(newDriver);
        });

    });

    describe('External driver', () => {

        it('No external driver', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            expect(volume.isExternalVolume()).to.be.equal(false);
        });

        it('Set external driver fail when driver is set', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            volume.setDriver('driver');
            expect(function () {
                volume.setExternal();
            }).to.throw('Cannot set external volume that use driver or driver_opts');
        });

        it('Set external driver fail when driver options is set', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            volume.setAdditionalData(Volume.DRIVER_OPTIONS_FIELD_NAME, 'value');
            expect(function () {
                volume.setExternal();
            }).to.throw('Cannot set external volume that use driver or driver_opts');

        });

        it('Set external driver ', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            volume.setExternal();
            expect(volume.isExternalVolume()).to.be.equal(true);

        });


    });


    describe('Local driver', () => {

        it('No driver set and no default', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            expect(volume.isUsingLocalDriver()).to.be.equal(true);
        });

        it('Driver set to local', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            volume.setDriver(Volume.LOCAL_PROPERTY);
            expect(volume.isUsingLocalDriver()).to.be.equal(true);
        });

        it('Default driver is set', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            volume.setAdditionalData('_defaultDriver', Volume.LOCAL_PROPERTY);
            expect(volume.isUsingLocalDriver()).to.be.equal(true);
        });

        it('Driver is set to non local', () => {
            const name   = 'my-volume';
            const volume = new Volume(name);
            volume.setDriver('my-driver');
            expect(volume.isUsingLocalDriver()).to.be.equal(false);
        });


    });




});

