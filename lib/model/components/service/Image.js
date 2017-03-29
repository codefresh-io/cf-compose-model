'use strict';
/*jslint latedef:false*/
const Base                      = require('../Base');
const FieldNotSupportedByPolicy = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

class Image extends Base {

    constructor(stringValue) {
        super('image');

        if (stringValue) {
            this._parse(stringValue);
        }
    }

    _createWarning(type) {
        const cases = {
            'LACK_OF_DETAILS_TAG': () => {
                if (!this.getTag()) {

                    const warning = new FieldNotSupportedByPolicy(type.name, `${this.getOwner() ?
                    this.getOwner() + ':' :
                        ''}${this.getRepo()}`, 'latest');
                    warning.setAutoFix();
                    return warning;
                }
            },
            'LACK_OF_DETAILS_OWNER_NAME': () => {
                if (!this.getOwner()) {
                    const warning = new FieldNotSupportedByPolicy(type.name, `${this.getRepo()}${this.getTag() ?
                    ':' + this.getTag() : ''}`, '');
                    warning.setRequireManuallyFix();
                    return warning;
                }
            }

        };
        if (cases[type.name]) {
            return cases[type.name]();
        }
    }

    _fixWarning(type) {
        const cases = {
            'MISSING_IMAGE_DETAILS_TAG': () => {
                this.setTag('latest');
            }
        };

        if (cases[type.name]) {
            cases[type.name]();
        }
    }

    _parse(stringValue) {
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

        this.setOwner(owner)
            .setRepo(repoName)
            .setTag(tag);
    }

    setRepo(name) {
        this._repoName = name;
        return this;
    }

    getRepo() {
        return this._repoName;
    }

    setOwner(owner) {
        this._owner = owner;
        return this;
    }

    getOwner() {
        return this._owner;
    }

    setTag(tag) {
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
            const warning   = new FieldNotSupportedByPolicy(this.getName(), this.getName(), suggestion, 'Add tag', true);
            this.warnings.push(warning);
        }

        if (!this.getOwner() && policy.isMissingOwnerReproduceWarning()) {
            const suggestion = `${this.getRepo()}${this.getTag() ?
            ':' + this.getTag() : ''}`;
            const warning = new FieldNotSupportedByPolicy(this.getName(), this.getName(), suggestion, '');
            this.warnings.push(warning);
        }



        return this.warnings;
    }

    getName() {
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