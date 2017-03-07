'use strict';

const CFLeaf  = require('./../base').CFLeaf;
const Warning = require('./../../ComposeWarning');

class Volume extends CFLeaf {
    constructor(target, source, accessMode, parentFieldName) {
        super(parentFieldName);
        this.source = source;
        this.target = target;
        this.accessMode = accessMode;
        this.stringValue = `${this.source ? this.source + ':' : ''}${this.target}${this.accessMode ? ':' + this.accessMode : ''}`; // TODO : fix later
    }

    _createWarning(type, actualValue) {
        const cases = {
            'NO_PERMISSION': () => {
                if (this.source) {
                    const warning = new Warning(type.name, this.toString(), `${this.target}`);
                    warning.requireManuallyFix = true;
                    return warning;
                }
            }
        };
        if (cases[type.name]) {
            return cases[type.name](actualValue);
        }
    }

    static parse(stringValue, parentFieldName){
        const volumes = stringValue.split(':');
        let source;
        let target;
        let accessMode;
        if(volumes.length === 1){
            target = volumes[0];
        } else if(volumes.length === 3){
            accessMode = volumes[2];
            source = volumes[0];
            target = volumes[1];
        } else {
            source = volumes[0];
            target = volumes[1];
        }
        return new Volume(target, source, accessMode, parentFieldName);
    }
}

module.exports = Volume;