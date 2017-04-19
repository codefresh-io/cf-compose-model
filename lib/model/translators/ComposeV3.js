'use strict';

const Base                      = require('./Base');
const Promise                   = require('bluebird'); // jshint ignore:line
const FieldNotSupportedByPolicy = require('./../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

class ComposeV3 extends Base {

    _toJson(compose) {
        let json = {
            version: '3'
        };

        const serviceKeys  = compose.getServicesOrder();
        const jsonServices = json['services'] = {};

        return Promise.map(serviceKeys, (serviceName) => {

            const serviceInstance     = compose.getServiceByName(serviceName);
            jsonServices[serviceName] = {};
            const order               = serviceInstance.getOrder();
            const serviceJson         = {};

            return Promise.map(order, (name) => {
                const cases = {
                    'image': () => {
                        this._translateImage(serviceInstance, serviceJson);
                    },
                    'ports': () => {
                        this._translatePorts(serviceInstance, serviceJson);
                    },
                    'volumes': () => {
                        this._translateServiceVolumes(serviceInstance, serviceJson);
                    }
                };

                if (cases[name]) {
                    cases[name]();
                    return Promise.resolve();
                } else {
                    const obj = serviceInstance.getByName(name);
                    if (obj instanceof FieldNotSupportedByPolicy) {
                        serviceJson[name] = obj.getFieldValue();
                    } else {
                        serviceJson[name] = obj;
                    }

                    return Promise.resolve();
                }

            })
                .then(() => {
                    jsonServices[serviceName] = serviceJson;
                });

        })
            .then(() => {
                return this._translateGlobalVolumes(compose, json);
            })
            .then(() => {
                return this._translateGlobalNetworks(compose, json);
            })
            .then(() => {
                return json;
            });
    }

}

module.exports = ComposeV3;