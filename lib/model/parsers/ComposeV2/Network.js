'use strict';

const NetworkComponent                   = require('./../../components/network/Network');
const FieldNotSupportedByOriginalParser = require('./../../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const Promise                           = require('bluebird'); // jshint ignore:line
const _                                 = require('lodash');

const fields = ['driver', 'driver_opts', 'external'];

class Network {

    constructor(name, value) {
        this.name = name;
        this.obj  = value;
    }

    parse(accessibility) { // jshint ignore:line

        const networkInstance = new NetworkComponent(this.name);
        const networkObject   = this.obj;
        networkInstance.setOrder(Object.keys(networkObject || {}));
        if (networkObject) {
            const networkKeys = Object.keys(networkObject);
            return Promise.map(networkKeys, (fieldName) => {
                const fieldValue = networkObject[fieldName];
                if (_.indexOf(fields, fieldName) < 0) {
                    const err = new FieldNotSupportedByOriginalParser(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose v2 under networks`);
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