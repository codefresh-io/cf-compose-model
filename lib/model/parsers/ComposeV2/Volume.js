'use strict';

const VolumeComponent                  = require('./../../components/volume/Volume');
const FieldNotSupportedByOriginalParser = require('./../../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const InvalidSyntexForParser            = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const FieldNotSupportedByPolicy         = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
const Promise                           = require('bluebird');
const _                                 = require('lodash');
const type                              = require('type-detect');

const fields = ['driver', 'driver_opts', 'external']

class Volume {

    constructor(name, value) {
        this.name = name;
        this.obj = value;
    }

    //Should be object
    parse(accessibility) {

        const volumeInstance = new VolumeComponent(this.name);
        const volumeObject   = this.obj;
        if (volumeObject) {
            const volumeKeys = Object.keys(volumeObject);
            return Promise.map(volumeKeys, (fieldName) => {
                const fieldValue = volumeObject[fieldName];

                if (_.indexOf(fields, fieldName) < 0) {
                    const err = new FieldNotSupportedByPolicy(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose v2 under volumes`);
                    volumeInstance.setAdditionalData(fieldName, err);
                } else {
                    volumeInstance.setAdditionalData(fieldName, fieldValue);
                }
            })
                .then(() => {
                    return volumeInstance;
                });
        } else {
            return volumeInstance;
        }
    }
}


module.exports = Volume;