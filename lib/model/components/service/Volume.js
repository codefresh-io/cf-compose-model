'use strict';
/*jslint latedef:false*/
const Promise = require('bluebird');

const Base    = require('../Base');
const Warning = require('../../ComposeWarning');


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

    getWarnings(allowVolumeMapping) {
        this.warnings = [];
        if (!allowVolumeMapping && this.getSource()) {
            const warning              = new Warning('VOLUME_MAPPING_NOT_ALLOWED', `${this.getSource()}:${this.getTarget()}`, `${this.getTarget()}`);
            warning.requireManuallyFix = true;
            this.warnings.push(warning);
        }
        return Promise.resolve(this.warnings);
    }
}


module.exports = ServiceVolume;