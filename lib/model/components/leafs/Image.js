'use strict';
/*jslint latedef:false*/
const Warning     = require('./../../ComposeWarning');
const CFLeaf      = require('./../base').CFLeaf;
const BaseBuilder = require('./../base/BaseBuilder');



class Image extends CFLeaf {
    constructor(imageBuilder) {
        if (!(imageBuilder instanceof ImageBuilder)) {
            throw new Error('Image accept only ImageBuilder instance');
        }
        super(imageBuilder.parent);
        this._owner       = imageBuilder.owner;
        this._repoName    = imageBuilder.repoName;
        this._tag         = imageBuilder.tag;
        this._stringValue = `${this.owner ? this.owner + '/' : ''}${this.repoName}${this.tag ?
        ':' + this.tag : ''}`;
    }

    get owner() {
        return this._owner;
    }

    set owner(newValue){
        this._owner = newValue;
    }

    get repoName() {
        return this._repoName;
    }

    set repoName(newValue){
        this._repoName = newValue;
    }

    get tag() {
        return this._tag;
    }

    set tag(newValue){
        this._tag = newValue;
    }

    _createWarning(type) {
        const cases = {
            'LACK_OF_DETAILS_TAG': () => {
                if (!this._tag) {

                    const warning   = new Warning(type.name, `${this.owner ? this.owner + ':' :
                        ''}${this.repoName}`, 'latest');
                    warning.autoFix = true;
                    return warning;
                }
            },
            'LACK_OF_DETAILS_OWNER_NAME': () => {
                if (!this._owner) {
                    const warning              = new Warning(type.name, `${this.repoName}${this.tag ?
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

    _fixWarning(type) {
        const cases = {
            'LACK_OF_DETAILS_TAG': () => {
                this.tag         = 'latest';
                this.stringValue =
                    `${this.owner ? this.owner + '/' : ''}${this.repoName}${this.tag ?
                    ':' + this.tag : ''}`;
            }
        };

        if (cases[type.name]) {
            cases[type.name]();
        }
    }

    static parse(stringValue, parentFieldName) {
        let owner;
        let repoName;
        let tag;
        const imageDetails       = stringValue.split(':');
        tag                      = imageDetails[1];
        const ownerAndImangeName = imageDetails[0];
        const ownerAndService    = ownerAndImangeName.split('/');
        if (ownerAndService.length > 1) {
            owner    = ownerAndService[0];
            repoName = ownerAndService[1];
        } else {
            repoName = ownerAndService[0];
        }
        return new ImageBuilder()
            .buildOwner(owner)
            .buildTag(tag)
            .buildParent(parentFieldName)
            .buildRepo(repoName)
            .build();
    }
}

class ImageBuilder extends BaseBuilder {
    buildOwner(owner) {
        this.owner = owner;
        return this;
    }

    buildTag(tag) {
        this.tag = tag;
        return this;
    }

    buildRepo(name) {
        this.repoName = name;
        return this;
    }

    buildRegistry(name) {
        this.repoName = name;
        return this;
    }

    build() {
        this.done = true;
        return new Image(this);
    }
}



Image.ImageBuilder = ImageBuilder;

module.exports = Image;