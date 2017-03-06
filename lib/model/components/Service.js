'use strict';
const _             = require('lodash');
const Base          = require('./BaseComponent');
const Label         = require('./Label');
const Port          = require('./Port');
const Volume        = require('./Volume');
const ContainerName = require('./ContainerName');
const Build         = require('./Build');


const errorMessages = {
    emptyName: 'Cant initiate service that have no name or name is empty string',
    emptyData: 'Cant init Service without data'
};

/**
 * name: name of the service
 * data:
 *  build: String or Object
 *  dockerfile: String - path to dockerfile - default is Dockerfile
 *  command: String or array
 *  containerName: String. // Because Docker container names must be unique, you cannot scale a service beyond 1 container if you have specified a custom name. Attempting to do so results in an error.
 *  entryPoint: String or array
 *
 */

class Service extends Base {
    constructor(serviceName, data) {
        super();
        this.name = serviceName;
        if (!data) {
            throw new Error(errorMessages.emptyData);
        }

        const serviceJson = _.cloneDeep(data);

        if (serviceJson.labels) {
            this.labels  = [];
            const labels = serviceJson.labels;
            if (_.isArray(labels)) {
                _.forEach(labels, (label) => {
                    const kv    = label.split('=');
                    const key   = kv[0];
                    const value = kv[1];
                    this.labels.push(new Label(key, value));
                });
            } else {
                _.forOwn(labels, (value, key) => {
                    this.labels.push(new Label(key, value));
                });
            }
            delete serviceJson.labels;
        }

        if (serviceJson.ports) {

            this.ports  = [];
            const ports = serviceJson.ports;

            if (_.isArray(ports)) {
                _.forEach(ports, (port) => {
                    this.ports.push(Port.parsePort(port));
                });
            } else {
                _.forOwn(ports, (port) => {
                    this.ports.push(Port.parsePort(port));
                });
            }

            delete serviceJson.ports;
        }

        if (serviceJson.volumes) {
            this.volumes  = [];
            const volumes = serviceJson.volumes;

            if (_.isArray(volumes)) {
                _.forEach(volumes, (volume) => {
                    this.volumes.push(Volume.parseVolume(volume));
                });
            } else {
                _.forOwn(volumes, (volume) => {
                    this.volumes.push(Volume.parseVolume(volume));
                });
            }


            delete serviceJson.volumes;
        }

        if (serviceJson.build) {
            const buildData = serviceJson.build;
            this.build = new Build(buildData);
            delete serviceJson.build;
        }
        if (serviceJson['container_name']) {
            const containerName = serviceJson['container_name'];
            this.containerName  = new ContainerName(containerName);
            delete serviceJson['container_name'];
        }

        _.merge(this, serviceJson);
    }

    getWarnings(policy) {
        let warnings = [];
        _.forOwn(this, (field, fieldName) => {
            if (_.isArray(field)) {
                _.forEach(field, (value) => {
                    if (value instanceof Base) {
                        const warningsArr = value.getWarnings(policy);
                        if (warningsArr && warningsArr.length) {
                            _.forEach(warningsArr, (warning) => {
                                warning.message = `Warning: at service ${this.name}.${fieldName}`;
                                value.warnings.push(warning);
                                warnings.push(warning);
                            });
                        }
                    }
                })
            } else {
                if (field instanceof Base) {
                    const warningsArr = field.getWarnings(policy);
                    _.forEach(warningsArr, (warning) => {
                        warning.message = `Warning: at service ${this.name}.${fieldName}`;
                        field.warnings.push(warning);
                        warnings.push(warning);
                    });
                }
            }
        });
        return warnings;
    }

    fixWarnings(){
        _.forOwn(this, (field) => {
            if(_.isArray(field) && field[0] instanceof Base){
                _.forEach(field, (value) => {
                    if(value.warnings.length > 0) {
                        value.fixWarnings();
                    }
                });
            }
            if(field instanceof Base && field.warning){
                field.fixWarnings();
            }
        });
    }

    addLabel(label) {
        if (!this.labels) {
            this.labels = [];
        }
        this.labels.push(label);
    }

    addEnvironmentVariable(key, value) {
        if (!this.environments) {
            this.environments = {};
        }

        if (_.isArray(this.environments)) {
            this.environments.push(`${key}=${value}`);
        }
        this.environments[key] = value;
    }

}

module.exports = Service;