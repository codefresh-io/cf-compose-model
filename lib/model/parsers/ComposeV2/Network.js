'use strict';

const NetworkComponent                   = require('./../../components/network/Network');
const FieldNotSupportedByOriginalParser = require('./../../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const InvalidSyntexForParser            = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const FieldNotSupportedByPolicy         = require('./../../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');
const Promise                           = require('bluebird');
const _                                 = require('lodash');
const type                              = require('type-detect');

const fields = ['driver', 'driver_opts', 'external'];

class Network {

    constructor(name, value) {
        this.name = name;
        this.obj  = value;
    }

    //Should be object
    parse(accessibility) {

        const networkInstance = new NetworkComponent(this.name);
        const networkObject   = this.obj;
        networkInstance.setOrder(Object.keys(networkObject));
        if (networkObject) {
            const networkKeys = Object.keys(networkObject);
            return Promise.map(networkKeys, (fieldName) => {
                const fieldValue = networkObject[fieldName];
                if (_.indexOf(fields, fieldName) < 0) {
                    const err = new FieldNotSupportedByPolicy(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose v2 under networks`);
                    networkInstance.setAdditionalData(fieldName, err);
                } else {
                    networkInstance.setAdditionalData(fieldName, fieldValue);
                }
            })
                .then(() => {
                    return networkInstance;
                });
        } else {
            return networkInstance;
        }

    }
}


module.exports = Network;