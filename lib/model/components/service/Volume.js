'use strict';
/*jslint latedef:false*/
const Promise                   = require('bluebird'); // jshint ignore:line
const _                         = require('lodash');
const Base                      = require('../Base');
const typeValidation            = require('./../../utils/typeValidation');
const FieldNotSupportedByPolicy = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
const promiseProvider           = require('./../../promise-provider/PromiseProvider').build();



class ServiceVolume extends Base {
    constructor(stringValue) {
        super('volumes');
        if (stringValue) {
            if (!typeValidation.isTypeValid(stringValue, 'string')) {
                throw new Error('TYPE_NOT_MATCH');
            }
            this._parse(stringValue);
        }

    }


    _parse(stringValue) {
        const volumes = stringValue.split(':');
        let source;
        let target;
        let accessMode;
        if (volumes.length === 1) {
            target = volumes[0];
        } else if (volumes.length === 3) {
            accessMode = volumes[2];
            source     = volumes[0];
            target     = volumes[1];
        } else {
            source = volumes[0];
            target = volumes[1];
        }
        target && this.setTarget(target); // jshint ignore:line
        source && this.setSource(source); // jshint ignore:line
        accessMode && this.setAccessMode(accessMode); // jshint ignore:line

    }

    getTarget() {
        return this._target;
    }

    setTarget(target) {
        if (!typeValidation.isTypeValid(target, 'string')) {
            throw new Error('TYPE_NOT_MATCH');
        }
        this._target = target;
        return this;
    }

    getSource() {
        return this._source;
    }

    setSource(source) {
        if (!typeValidation.isTypeValid(source, 'string')) {
            throw new Error('TYPE_NOT_MATCH');
        }
        this._source = source;
        return this;
    }

    getAccessMode() {
        return this._accessMode;
    }

    setAccessMode(mode) {
        if (!typeValidation.isTypeValid(mode, 'string')) {
            throw new Error('TYPE_NOT_MATCH');
        }
        this._accessMode = mode;
        return this;
    }

    /**
     * @param allowVolumeMapping
     * @param allowedVolumes
     * @param globalVolumeWithLocalDriver
     * @return {Promise.<Array>} bluebird
     * @private
     */
    _getWarnings(allowVolumeMapping, { allowedVolumes, globalVolumeWithLocalDriver }){
        this.warnings = [];
        const source  = this.getSource();
        if (!allowVolumeMapping && source &&
            _.indexOf(globalVolumeWithLocalDriver || [], source) === -1) {
            if (_.indexOf(allowedVolumes, this.getSource()) === -1) {
                const suggestion    = `Volume mapping is not supported, try use: ${this.getTarget()}`;
                const message       = '';
                const warning       = new FieldNotSupportedByPolicy(this.getSource(), this.getTarget(), suggestion, message, false, true);
                warning.displayName = 'volumes';
                this.warnings.push(warning);
            }
        }
        return Promise.resolve(this.warnings);
    }

    /**
     *
     * @param allowVolumeMapping
     * @param allowedVolumes
     * @param globalVolumeWithLocalDriver
     * @return {*} return promise with provider
     */
    getWarnings(allowVolumeMapping, { allowedVolumes, globalVolumeWithLocalDriver }) {
        return promiseProvider.resolve(this._getWarnings(allowVolumeMapping, { allowedVolumes, globalVolumeWithLocalDriver }));
    }
}


module.exports = ServiceVolume;