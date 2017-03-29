'use strict';
/*jslint latedef:false*/
const Promise                   = require('bluebird'); // jshint ignore:line
const _                         = require('lodash');
const Base                      = require('../Base');
const FieldNotSupportedByPolicy = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');


class ServiceVolume extends Base {
    constructor(stringValue) {
        super('volumes');
        if (stringValue) {
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
        this.setTarget(target)
            .setSource(source)
            .setAccessMode(accessMode);

    }

    getTarget() {
        return this._target;
    }

    setTarget(target) {
        this._target = target;
        return this;
    }

    getSource() {
        return this._source;
    }

    setSource(source) {
        this._source = source;
        return this;
    }

    getAccessMode() {
        return this._accessMode;
    }

    setAccessMode(mode) {
        this._accessMode = mode;
        return this;
    }

    getWarnings(allowVolumeMapping, { allowedVolumes, globalVolumeWithLocalDriver }) {
        this.warnings = [];
        const source = this.getSource();
        if (!allowVolumeMapping && source && _.indexOf(globalVolumeWithLocalDriver || [], source) === -1 ) {
            if (_.indexOf(allowedVolumes, this.getSource()) === -1) {
                const suggestion = `Volume mapping is not allowed, try use: ${this.getTarget()}`;
                const message    = '';
                const warning    = new FieldNotSupportedByPolicy(this.getSource(), this.getTarget(), suggestion, message, false, true);
                warning.displayName = 'volumes';
                this.warnings.push(warning);
            }
        }
        return Promise.resolve(this.warnings);
    }
}


module.exports = ServiceVolume;