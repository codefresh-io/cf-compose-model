'use strict';

const _       = require('lodash');
const Warning = require('./../../ComposeWarning');
const CFLeaf  = require('./../base').CFLeaf;


class Image extends CFLeaf {
    constructor(owner, imageName, tag) {
        super();
        this.owner       = owner;
        this.imageName   = imageName;
        this.tag         = tag;
        this.stringValue = `${this.owner ? this.owner + '/' : ''}${this.imageName}${this.tag ?
        ':' + this.tag : ''}`;
    }

    toString() {
        return `${this.stringValue}`;
    }

    getWarnings(policy) {
        const res        = this.warnings = [];
        const voilations = policy.image || [];
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
            'LACK_OF_DETAILS_TAG': () => {
                if (!this.tag) {
                    const warning   = new Warning(type.name, `${this.owner ? this.owner + ':' :
                        ''}${this.imageName}`, 'latest');
                    warning.autoFix = true;
                    return warning;
                }
            },
            'LACK_OF_DETAILS_OWNER_NAME': () => {
                if (!this.owner) {
                    const warning              = new Warning(type.name, `${this.imageName}${this.tag ?
                    ':' + this.tag : ''}`, '');
                    warning.requireManuallyFix = type.requireManuallyFix;
                    return warning;
                }
            }

        };
        if (cases[type.name]) {
            return cases[type.name]();
        }
    }

    fixWarnings() {
        _.forEach(this.warnings, warning => {
            this._fixWarning(warning);
        });
    }

    _fixWarning(type) {
        const cases = {
            'LACK_OF_DETAILS_TAG': () => {
                this.tag = 'latest';
                this.stringValue = `${this.owner ? this.owner + '/' : ''}${this.imageName}${this.tag ?
                ':' + this.tag : ''}`;
            }
        };

        if (cases[type.name]) {
            cases[type.name]();
        }
    }

    static parse(stringValue) {
        let owner;
        let imageName;
        let tag;
        const imageDetails       = stringValue.split(':');
        tag                      = imageDetails[1];
        const ownerAndImangeName = imageDetails[0];
        const ownerAndService    = ownerAndImangeName.split('/');
        if (ownerAndService.length > 1) {
            owner     = ownerAndService[0];
            imageName = ownerAndService[1];
        } else {
            imageName = ownerAndService[0];
        }
        return new Image(owner, imageName, tag);
    }
}

module.exports = Image;