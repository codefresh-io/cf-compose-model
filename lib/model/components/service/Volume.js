'use strict';
/*jslint latedef:false*/
const Base    = require('../Base');
const Warning = require('../../ComposeWarning');


class ServiceVolume extends Base {
    constructor(volumeData) {
        super('volumes');
        if (volumeData) {
            this.setSource(volumeData.source);
            this.setTarget(volumeData.target);
            this.setAccessMode(volumeData.accessMode);
        }
    }

    _createWarning(type, actualValue) {
        const cases = {
            'NO_PERMISSION': () => {
                if (this.getSource()) {
                    const warning              = new Warning(type.name, `${this.getSource()}:${this.getTarget()}`, `${this.getTarget()}`);
                    warning.requireManuallyFix = true;
                    return warning;
                }
            }
        };
        if (cases[type.name]) {
            return cases[type.name](actualValue);
        }
    }

    static parse(stringValue) {
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

        return new ServiceVolume({
            source: source,
            target: target,
            accessMode: accessMode
        });
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
}


module.exports = ServiceVolume;