'use strict';
/*jslint latedef:false*/
const Base                      = require('../Base');
const _                         = require('lodash');
const FieldNotSupportedByPolicy = require(
    './../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

class Image extends Base {

    constructor(stringValue) {
        super('image');
        if (stringValue) {
            if (!_.isString(stringValue, 'string')) {
                throw new Error('TYPE_NOT_MATCH');
            }
            this._parse(stringValue);
        }
    }

    _parse(stringValue) {
        const index = stringValue.lastIndexOf(':');
        if(stringValue.lastIndexOf(':') === -1 ){
            this.setRepo(stringValue);
        } else if(this._includingDnsWithPort(stringValue)) {
            this.setRepo(stringValue.substring(0, index));
            this.setTag(stringValue.substring(index + 1));
        } else {
            this.setRepo(stringValue);
        }
        this.originalName = stringValue;
    }
    _includingDnsWithPort(name){
        return /^(?![0-9]+$)(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$/g.test(name);
    }
    setRepo(name) {
        if (!_.isString(name, 'string')) {
            throw new Error('TYPE_NOT_MATCH');
        }
        this._repoName = name;
        return this;
    }

    getRepo() {
        return this._repoName;
    }

    setOwner(owner) {
        if (!_.isString(owner, 'string')) {
            throw new Error('TYPE_NOT_MATCH');
        }
        this._owner = owner;
        return this;
    }

    getOwner() {
        return this._owner;
    }

    setTag(tag) {
        if (!_.isString(tag, 'string')) {
            throw new Error('TYPE_NOT_MATCH');
        }
        this._tag = tag;
        return this;
    }

    getTag() {
        return this._tag;
    }

    getWarnings(policy) {
        this.warnings = [];

        if (!this.getTag() && policy.isMissingTagReproduceWarning()) {
            const suggestion = `${this.getOwner() ?
            this.getOwner() + ':' :
                ''}${this.getRepo()}`;
            const warning    = new FieldNotSupportedByPolicy(this.getName(), this.getName(), suggestion, 'Add tag', true);
            this.warnings.push(warning);
        }

        if (!this.getOwner() && policy.isMissingOwnerReproduceWarning()) {
            const suggestion = `${this.getRepo()}${this.getTag() ?
            ':' + this.getTag() : ''}`;
            const warning    = new FieldNotSupportedByPolicy(this.getName(), this.getName(), suggestion, '');
            this.warnings.push(warning);
        }



        return this.warnings;
    }

    getName() {
        if (this.originalName) {
            return this.originalName;
        }

        let imageString = '';
        const owner     = this.getOwner();
        const repo      = this.getRepo();
        const tag       = this.getTag();
        if (owner) {
            imageString += `${owner}/`;
        }
        imageString += `${repo}`;
        if (tag) {
            imageString += `:${tag}`;
        }

        return imageString;
    }
}

module.exports = Image;