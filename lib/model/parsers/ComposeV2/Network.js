'use strict';

const NetworkComponent                  = require('./../../components/network/Network');
const FieldNotSupportedByOriginalParser = require('./../../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const InvalidSyntexForParser            = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const Promise                           = require('bluebird'); // jshint ignore:line
const _                                 = require('lodash');
const type                              = require('type-detect');


const fields = ['driver', 'driver_opts', 'external'];
const privileged_fields = ['config', 'ipam'];
class Network {

    constructor(name, value) {
        this.errors = [];
        this.name   = name;
        this.obj    = value;
    }

    parse(accessibility) { // jshint ignore:line

        const networkInstance = new NetworkComponent(this.name);

        return Promise.resolve()
            .then(() => {
                const networkObject = this.obj;
                if (networkObject && !_.isPlainObject(networkObject)) {
                    const err = new InvalidSyntexForParser(this.name, this.obj, `Network must be object, got ${type(
                        this.obj)}`);
                    this.errors.push(err);
                    return;
                }

                if (networkObject) {
                    const isPrivilegedModeSupported = accessibility.isPrivilegedModeSupported();
                    const networkKeys = _.keys(networkObject);
                    networkInstance.setOrder(networkKeys);
                    return Promise.map(networkKeys, (fieldName) => {
                        const fieldValue = networkObject[fieldName];

                        if (_.indexOf(fields, fieldName) >= 0 || (_.indexOf(privileged_fields, fieldName) >=0 && isPrivilegedModeSupported)  ) {
                            networkInstance.setAdditionalData(fieldName, fieldValue); 
                        } else {
                            const err = new FieldNotSupportedByOriginalParser(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose under networks`);
                            this.errors.push(err);
                        }
                    })
                        .then(() => {
                            return networkInstance;
                        });


                } else {
                    networkInstance.setAdditionalData('driver', 'bridge');
                    return networkInstance;
                }
            })
            .then(() => {
                if (_.size(this.errors) > 0) {
                    const err    = new Error('FAILED_TO_PARSE');
                    err.errors   = this.errors;
                    err._network = networkInstance;
                    throw err;
                }
                return networkInstance;
            });
    }
}


module.exports = Network;