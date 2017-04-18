'use strict';
/*jslint latedef:false*/
const Base           = require('../Base');
const _              = require('lodash');
const typeValidation = require('./../../utils/typeValidation');

const FieldNotSupportedByPolicy = require(
    './../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
class Port extends Base {
    constructor(stringValue) {
        super('ports');

        if (stringValue) {
            if (!typeValidation.isAnyTypeValid(stringValue, ['string', 'number'])) {
                throw new Error('TYPE_NOT_MATCH');
            }
            this._parse(stringValue);
        }
    }

    _fixWarning(type) {
        if (type instanceof FieldNotSupportedByPolicy) {
            this._source = undefined;
        }
    }

    _parse(stringValue) {
        stringValue = stringValue.toString();
        const ports = stringValue.split(':');
        let source;
        let target;
        let protocol;
        if (ports.length === 1) {
            let targetWithProtocol = ports[0].split('/');
            protocol = targetWithProtocol[1];
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

        source && this.setSource(source); // jshint ignore:line
        target && this.setTarget(target); // jshint ignore:line
        protocol && this.setProtocol(protocol); // jshint ignore:line
    }

    _isValidSource(source) {
        if (!_.isString(source)) {
            return false;
        }

        return /(^\$.*)|(?:\w+\.\w+\.\w\.\w:)?[0-9]+/.test(source);
    }

    getTarget() {
        return this._target;
    }

    setTarget(target) {
        if (!typeValidation.isAnyTypeValid(target, ['string', 'number']) || isNaN(target) && !/[0-9]+-[0-9]+/.test(target) && !_.startsWith(target, '$')) {
            throw new Error('TYPE_NOT_MATCH');
        }
        this._target = target;
        return this;
    }

    getSource() {
        return this._source;
    }

    setSource(source) {
        if (!this._isValidSource(source)) {
            throw new Error('TYPE_NOT_MATCH');
        }
        this._source = source;
        return this;
    }

    getProtocol() {
        return this._protocol;
    }

    setProtocol(protocol) {
        if (!typeValidation.isTypeValid(protocol, 'string')) {
            throw new Error('TYPE_NOT_MATCH');
        }
        this._protocol = protocol;
        return this;
    }

    getWarnings(allowPortMapping) {
        this.warnings = [];
        if (!allowPortMapping && !!this.getSource()) {
            const message    = '';
            const suggestion = `Port mapping not supported, try use ${this.getTarget()}`;
            const value      = `${this.getSource()}:${this.getTarget()} ${this.getProtocol() ?
            '/' + this.getProtocol() : ''}`;
            const warning    = new FieldNotSupportedByPolicy('ports', value, suggestion, message);
            this.warnings.push(warning);
        }
        return this.warnings;
    }
}


module.exports = Port;