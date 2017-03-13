'use strict';
/*jslint latedef:false*/
const Warning     = require('./../../ComposeWarning');
const CFLeaf      = require('./../base').CFLeaf;



class Image extends CFLeaf {
    constructor(imageData) {
        super('image');
        if (imageData) {
            this.setRepo(imageData.repo);
            this.setOwner(imageData.owner);
            this.setTag(imageData.tag);
        }
    }

    _createWarning(type) {
        const cases = {
            'LACK_OF_DETAILS_TAG': () => {
                if (!this.getTag()) {

                    const warning   = new Warning(type.name, `${this.getOwner() ? this.getOwner() + ':' :
                        ''}${this.getRepo()}`, 'latest');
                    warning.autoFix = true;
                    return warning;
                }
            },
            'LACK_OF_DETAILS_OWNER_NAME': () => {
                if (!this.getOwner()) {
                    const warning              = new Warning(type.name, `${this.getRepo()}${this.getTag() ?
                    ':' + this.getTag() : ''}`, '');
                    warning.requireManuallyFix = type.requireManuallyFix;
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
            'LACK_OF_DETAILS_TAG': () => {
                this.setTag('latest');
            }
        };

        if (cases[type.name]) {
            cases[type.name]();
        }
    }

    static parse(stringValue) {
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


        return new Image({
            owner: owner,
            repo: repoName,
            tag: tag
        });

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
}

module.exports = Image;