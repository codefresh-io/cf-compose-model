'use strict';
/*jslint latedef:false*/
const Base                      = require('../Base');
const _                         = require('lodash');
const FieldNotSupportedByPolicy = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

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
        this.originalName = stringValue;

        let owner;
        let repoName;
        let tag;
        const imageDataArray = stringValue.split('/');
        if (!imageDataArray[1]) {
            const repoTagCandidates = imageDataArray[0].split(':');
            repoName                = repoTagCandidates[0];
            tag                     = repoTagCandidates[1];
        } else {
            const repoTagCandidates = imageDataArray[1].split(':');
            owner                   = imageDataArray[0];
            tag                     = repoTagCandidates[1];
            repoName                = repoTagCandidates[0];
        }

        owner && this.setOwner(owner); // jshint ignore:line
        repoName && this.setRepo(repoName); // jshint ignore:line
        tag && this.setTag(tag); // jshint ignore:line
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