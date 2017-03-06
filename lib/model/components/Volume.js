'use strict';

const Base    = require('./BaseComponent');
const Warning = require('./../ComposeWarning');
const _       = require('lodash');

class Volume extends Base {
    constructor(source, target) {
        super();
        this.source = source;
        this.target = target;
    }

    toString() {
        if(this.source){
            return `${this.source}:${this.target}`;
        }
        return `${this.target}`;
    }

    getWarnings(policy) {
        const res        = [];
        const voilations = policy.volumes || [];
        _.forEach(voilations, (violation) => {
            const warning = this._createWarning(violation, this.volume);
            if (warning) {
                res.push(warning);
            }
        });

        return res;
    }

    _createWarning(type, actualValue) {
        const cases = {
            'NO_PERMISSION': () => {
                if (this.source) {
                    return new Warning(type.name, this.toString(), `${this.target}`);
                }
            }
        };
        if (cases[type.name]) {
            return cases[type.name](actualValue);
        }
    }

    fixWarnings(){
        _.forEach(this.warnings, (/*warning*/) => {
            // this._fixWarning(warning)
        });
    }

    _fixWarning(type){
        const cases = {
            'NO_PERMISSION': () => {
                this.volume = type.suggestion;
            }
        };

        if(cases[type.name]){
            cases[type.name]();
        }
    }

    static parseVolume(volumeString){
        const volumes = volumeString.split(':');
        let source;
        let target;
        if(volumes.length === 1){
            target = volumes[0];
        } else {
            source = volumes[0];
            target = volumes[1];
        }
        return new Volume(source, target);
    }
}

module.exports = Volume;