'use strict';
/*jslint latedef:false*/
const Warning     = require('../../ComposeWarning');
const Base      = require('../Base');

class Port extends Base {
    constructor(stringValue) {
        super('ports');

        if (stringValue) {
            this._parse(stringValue);
        }
    }

    _fixWarning(type) {
        const cases =
              {
            'PORT_MAPPING_NOT_ALLOWED': () => {
                this.setSource(undefined);
            }
        };

        if (cases[type.name]) {
            return cases[type.name]();
        }
    }

    _parse(stringValue) {
        const ports = stringValue.split(':');
        let source;
        let target;
        let protocol;
        if (ports.length === 1) {
            let targetWithProtocol = ports[0].split('/');
            target                 = targetWithProtocol[0];
        } else if (ports.length === 3) {
            source               = `${ports[0]}:${ports[1]}`;
            let targetWithSource = ports[1].split('/');
            target               = targetWithSource[0];
            protocol             = targetWithSource[1];
        } else {
            source               = ports[0];
            let targetWithSource = ports[1].split('/');
            target               = targetWithSource[0];
            protocol             = targetWithSource[1];
        }

        this.setSource(source)
            .setTarget(target)
            .setProtocol(protocol);
    }

    getTarget(){
        return this._target;
    }

    setTarget(target){
        this._target = target;
        return this;
    }

    getSource(){
        return this._source;
    }

    setSource(source){
        this._source = source;
        return this;
    }

    getProtocol(){
        return this._protocol;
    }

    setProtocol(protocol){
        this._protocol = protocol;
        return this;
    }

    getWarnings(allowPortMapping) {
        this.warnings = [];
        if (!allowPortMapping && !!this.getSource()) {
            const warning = new Warning('PORT_MAPPING_NOT_ALLOWED', `${this.getSource()}:${this.getTarget()} ${this.getProtocol() ?
            '/' + this.getProtocol() : ''}`, `${this.getTarget()}`);
            this.warnings.push(warning);
        }
        return this.warnings;
    }
}


module.exports = Port;