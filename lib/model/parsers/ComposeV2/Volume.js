'use strict';

const VolumeComponent                  = require('./../../components/volume/Volume');
const FieldNotSupportedByOriginalParser = require('./../../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const Promise                           = require('bluebird'); // jshint ignore:line
const _                                 = require('lodash');
const type                              = require('type-detect');
const InvalidSyntexForParser            = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');

const fields = ['driver', 'driver_opts', 'external'];

class Volume {

    constructor(name, value) {
        this.name = name;
        this.obj = value;
    }

    parse(accessibility) { // jshint ignore:line

        const volumeInstance = new VolumeComponent(this.name);
        if(this.obj && !_.isPlainObject(this.obj)){
            return Promise.resolve()
                .then(() => {
                     return new InvalidSyntexForParser(this.name, this.obj, `Volume must be object, got ${type(this.obj)}`);
                });
        }
        const volumeObject   = this.obj;
        if (volumeObject) {
            const volumeKeys = Object.keys(volumeObject);
            return Promise.map(volumeKeys, (fieldName) => {
                const fieldValue = volumeObject[fieldName];

                if (_.indexOf(fields, fieldName) < 0) {
                    const err = new FieldNotSupportedByOriginalParser(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose v2 under volumes`);
                    volumeInstance.setAdditionalData(fieldName, err);
                } else {
                    volumeInstance.setAdditionalData(fieldName, fieldValue);
                }
            })
                .then(() => {
                    return volumeInstance;
                });
        } else {
            volumeInstance.setAdditionalData('driver', 'local');
            return volumeInstance;
        }
    }
}


module.exports = Volume;

