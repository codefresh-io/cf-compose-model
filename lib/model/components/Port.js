'use strict';

const _       = require('lodash');
const Base    = require('./BaseComponent');
const Warning = require('./../ComposeWarning');

class Port extends Base {
    constructor(source, target, protocol) {
        super();
        this.source   = source;
        this.target   = target;
        this.protocol = protocol;
    }

    toString() {
        if(this.source){
            return `${this.source}:${this.target}${this.protocol ? '/' + this.protocol : ''}`;
        } else {
            return `${this.target}${this.protocol ? '/' + this.protocol : ''}`;
        }
    }

    getWarnings(policy) {
        const res        = [];
        const voilations = policy.ports || [];
        _.forEach(voilations, (violation) => {
            const warning = this._createWarning(violation);
            if (warning) {
                res.push(warning);
            }
        });

        return res;
    }

    _createWarning(type) {
        const cases = {
            'NO_PERMISSION': () => {
                if (this.target) {
                    return new Warning(type.name, `${this.source}:${this.target} ${this.protocol ?
                    '/' + this.protocol : ''}`, `${this.target}`)
                }
            }
        };
        if (cases[type.name]) {
            return cases[type.name]();
        }
    }

    fixWarnings() {
        _.forEach(this.warnings, warning => {
            this._fixWarning(warning)
        });
    }

    _fixWarning(type) {
        const cases = {
            'NO_PERMISSION': () => {
                this.port = type.suggestion;
            }
        };

        if (cases[type.name]) {
            cases[type.name]();
        }
    }

    static parsePort(portString) {
        const ports = portString.split(':');
        let source;
        let target;
        let protocol;
        if(ports.length === 1){
            let targetWithProtocol = ports[0].split('/');
            target = targetWithProtocol[0];
            protocol = targetWithProtocol[1];
        } else {
            source = ports[0];
            let targetWithSource = ports[1].split('/');
            target = targetWithSource[0];
            protocol = targetWithSource[1];
        }

        return new Port(source, target, protocol);
    }
}

module.exports = Port;