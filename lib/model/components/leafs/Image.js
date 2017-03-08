'use strict';

const Warning     = require('./../../ComposeWarning');
const CFLeaf      = require('./../base').CFLeaf;
const BaseBuilder = require('./../base/BaseBuilder');


class Image extends CFLeaf {
    constructor(imageBuilder) {
        if (!(imageBuilder instanceof ImageBuilder)) {
            throw new Error('Image accept only ImageBuilder instance')
        }
        super(imageBuilder.parentFieldName);
        this.owner       = imageBuilder.owner;
        this.imageName   = imageBuilder.imageName;
        this.tag         = imageBuilder.tag;
        this.stringValue = `${this.owner ? this.owner + '/' : ''}${this.imageName}${this.tag ?
        ':' + this.tag : ''}`;
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

    _fixWarning(type) {
        const cases = {
            'LACK_OF_DETAILS_TAG': () => {
                this.tag         = 'latest';
                this.stringValue =
                    `${this.owner ? this.owner + '/' : ''}${this.imageName}${this.tag ?
                    ':' + this.tag : ''}`;
            }
        };

        if (cases[type.name]) {
            cases[type.name]();
        }
    }

    static parse(stringValue, parentFieldName) {
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
        return new ImageBuilder()
            .buildOwner(owner)
            .buildTag(tag)
            .buildParent(parentFieldName)
            .buildImageName(imageName)
            .build();
    }

}

class ImageBuilder extends BaseBuilder{
    buildOwner(owner) {
        this.owner = owner;
        return this;
    }

    buildTag(tag) {
        this.tag = tag;
        return this;
    }

    buildImageName(name) {
        this.imageName = name;
        return this;
    }

    build() {
        this.done = true;
        return new Image(this);
    }
}

Image.ImageBuilder = ImageBuilder;

module.exports = Image;