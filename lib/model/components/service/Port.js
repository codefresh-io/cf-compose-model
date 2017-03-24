'use strict';
/*jslint latedef:false*/
const Base                      = require('../Base');
const _                         = require('lodash');
const FieldNotSupportedByPolicy = require('./../../validations/Warnings/FieldNotSupportedByPolicy');

class Port extends Base {
    constructor(stringValue) {
        super('ports');

        if (stringValue) {
            this._parse(stringValue);
        }
    }

    _fixWarning(type) {
        if (type instanceof FieldNotSupportedByPolicy) {
            this.setSource(undefined);
        }
    }

    _parse(stringValue) {
        if (!_.isString(stringValue)) {
            stringValue = stringValue.toString();
        }
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

    getProtocol() {
        return this._protocol;
    }

    setProtocol(protocol) {
        this._protocol = protocol;
        return this;
    }

    getWarnings(allowPortMapping) {
        this.warnings = [];
        if (!allowPortMapping && !!this.getSource()) {
            const message = '';
            const suggestion = `Avoid using port mapping, try use ${this.getTarget()}`;
            const value = `${this.getSource()}:${this.getTarget()} ${this.getProtocol() ? '/' + this.getProtocol() : ''}`;
            const warning = new FieldNotSupportedByPolicy('ports', value, suggestion, message);
            this.warnings.push(warning);
        }
        return this.warnings;
    }
}


module.exports = Port;