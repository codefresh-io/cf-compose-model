'use strict';

const _       = require('lodash');
const Base    = require('./BaseComponent');
const Warning = require('./../ComposeWarning');

class Build extends Base {
    constructor(buildValue){
        super();
        this.buildValue = buildValue;
    }

    toString(){
        return `${this.buildValue}`;
    }

    getWarnings(policy) {
        const res        = [];
        const voilations = policy['build'] || [];
        _.forEach(voilations, (violation) => {
            const warning = this._createWarning(violation, this.buildValue);
            if (warning) {
                res.push(warning);
            }
        });
        return res;
    }

    _createWarning(type, actualValue) {
        const cases = {
            'NOT_SUPPORTED': (actualValue) => {
                const warning = new Warning(type.name, actualValue, `replace with image`);
                warning.autoFix = true;
                return warning;
            }
        };
        if (cases[type.name]) {
            return cases[type.name](actualValue);
        }
    }


}

module.exports = Build;