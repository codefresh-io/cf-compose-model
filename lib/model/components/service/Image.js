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
        const numberOfColons = (stringValue.match(/:/g) || []).length;
        const cases          = {
            0: () => {
                this.setRepo(stringValue);
            },
            1: () => {
                const splitByColons    = stringValue.split(':');
                const candidate        = splitByColons[1] || '';
                const lastIndexOfColon = stringValue.lastIndexOf(':');

                if (candidate.indexOf('/') > 0) {
                    this.setRepo(stringValue);

                } else {
                    this.setRepo(stringValue.substring(0, lastIndexOfColon));
                    this.setTag(stringValue.substring(lastIndexOfColon + 1));
                }
            },
            2: () => {
                const lastIndexOfColon = stringValue.lastIndexOf(':');
                this.setRepo(stringValue.substring(0, lastIndexOfColon));
                this.setTag(stringValue.substring(lastIndexOfColon + 1));
            }
        };
        if (cases[numberOfColons]) {
            cases[numberOfColons]();
        }
        return;
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

    getName() {
        let imageString = '';
        const repo      = this.getRepo();
        const tag       = this.getTag();
        imageString += `${repo}`;
        if (tag) {
            imageString += `:${tag}`;
        }

        return imageString;
    }
}

module.exports = Image;