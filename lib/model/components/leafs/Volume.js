'use strict';
/*jslint latedef:false*/
const CFLeaf      = require('./../base').CFLeaf;
const Warning     = require('./../../ComposeWarning');
const BaseBuilder = require('./../base/BaseBuilder');


class Volume extends CFLeaf {
    constructor(volumeBuilder) {
        if (!(volumeBuilder instanceof VolumeBuilder)) {
            throw new Error('Volume accept only VolumeBuilder instance');
        }
        super(volumeBuilder.parent);
        this._source     = volumeBuilder.source;
        this._target     = volumeBuilder.target;
        this._accessMode = volumeBuilder.accessMode;
        this.stringValue = `${this.source ? this.source + ':' : ''}${this.target}${this.accessMode ?
        ':' + this.accessMode : ''}`; // TODO : fix later
    }

    get source() {
        return this._source;
    }

    set source(newValue) {
        this._source = newValue;
    }

    get target() {
        return this._target;
    }

    set target(newValue) {
        this._target = newValue;
    }

    get accessMode() {
        return this._accessMode;
    }

    set accessMode(newValue) {
        this._accessMode = newValue;
    }

    _createWarning(type, actualValue) {
        const cases = {
            'NO_PERMISSION': () => {
                if (this.source) {
                    const warning              = new Warning(type.name, this.toString(), `${this.target}`);
                    warning.requireManuallyFix = true;
                    return warning;
                }
            }
        };
        if (cases[type.name]) {
            return cases[type.name](actualValue);
        }
    }

    static parse(stringValue, parentFieldName) {
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

        return new VolumeBuilder()
            .buildAccessMode(accessMode)
            .buildSource(source)
            .buildTarget(target)
            .buildParent(parentFieldName)
            .build();
    }
}

class VolumeBuilder extends BaseBuilder {

    buildSource(source) {
        this.source = source;
        return this;
    }

    buildTarget(target) {
        this.target = target;
        return this;
    }

    buildAccessMode(mode) {
        this.accessMode = mode;
        return this;
    }

    build() {
        this.done = true;
        return new Volume(this);
    }

}

Volume.VolumeBuilder = VolumeBuilder;

module.exports = Volume;