'use strict';

const _               = require('lodash');
const Promise         = require('bluebird'); // jshint ignore:line
const ComposeWarning  = require('./../errorsAndWarnings/Warnings/Warning');

class BaseComponent {
    constructor(name) {
        if (!name) {
            throw new Error(`${new.target.name} must have a name`);
        }
        this._name     = name;
        this.warnings  = [];
        this._metadata = {};
        this._order    = [];
    }

    getName() {
        return this._name;
    }

    changeName(value) {
        this._name = value;
    }

    get(fields) {
        const res = _.pick(this, fields);
        return res;
    }

    fixWarnings(onlyAutoFix) {
        _.forEach(this.warnings, warning => {
            if (!onlyAutoFix || (onlyAutoFix && warning.isAutoFix())) {
                this._fixWarning(warning);
            }
        });
    }

    _fixWarning() {}

    setOrder(array) {
        _.set(this, '_order', array);
    }

    setAdditionalData(name, data) {
        if (!this.isKeyExistInOrder(name)) {
            this.pushToOrder(name);
        }
        this[name] = data;
        return this;
    }

    addMetadata(key, obj) {
        this._metadata[key] = obj;
        return this;
    }

    getMetadata() {
        return this._metadata;
    }

    _getAllWarningsFromSelf() {
        const values = _.values(this);
        const res    = [];
        return Promise.map(values, (value) => {
            if (value instanceof ComposeWarning) {
                res.push(value);
            }
        })
            .then(() => {
                return res;
            });
    }

    pushToOrder(key) {
        this._order.push(key);
    }

    isKeyExistInOrder(key) {
        return _.indexOf(this._order, key) >= 0;
    }

    getByName(name) {
        return this[name];
    }
}

module.exports = BaseComponent;