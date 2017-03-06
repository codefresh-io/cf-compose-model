'use strict';

const Base    = require('./BaseComponent');
const Warning = require('./../ComposeWarning');
const _       = require('lodash');

class ContainerName extends Base {
    constructor(name) {
        super();
        this.containerName = name;
        this.key           = 'container_name';
        this.warning = new Warning('NOT_SUPPORTED', this.containerName , `remove field`); // todo: refactor

    }

    toString() {
        return `${this.containerName}`;
    }

    getWarnings(policy) {
        const res        = [];
        const voilations = policy['container_name'] || [];
        _.forEach(voilations, (violation) => {
            const warning = this._createWarning(violation, this.containerName);
            if (warning) {
                res.push(warning);
            }
        });
        return res;
    }

    _createWarning(type, actualValue) {
        const cases = {
            'NOT_SUPPORTED': (actualValue) => {
                const warning   = new Warning(type.name, actualValue, `remove field`);
                warning.autoFix = true;
                return warning;
            }
        };
        if (cases[type.name]) {
            return cases[type.name](actualValue);
        }
    }
}

module.exports = ContainerName;