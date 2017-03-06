'use strict';
const _                   = require('lodash');
const Base                = require('./BaseComponent');
const Label               = require('./Label');
const Port                = require('./Port');
const Volume              = require('./Volume');
const Image               = require('./Image');
const EnvironmentVariable = require('./EnvironmentVariable');
const Warning             = require('./../ComposeWarning');

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
        if (!serviceName) {
            throw new Error(errorMessages.emptyName);
        }
        super();
        this.name         = serviceName;
        const serviceJson = _.cloneDeep(data) || {};

        if (serviceJson.labels) {
            this.labels  = [];
            const labels = serviceJson.labels;
            if (_.isArray(labels)) {
                _.forEach(labels, (label) => {
                    this.labels.push(Label.parse(label));
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
                    this.ports.push(Port.parse(port));
                });
            } else {
                _.forOwn(ports, (port) => {
                    this.ports.push(Port.parse(port));
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

        if (serviceJson.image) {
            this.image = Image.parse(serviceJson.image);
            delete serviceJson.build;
        }

        if (serviceJson.environment) {
            const envs       = serviceJson.environment;
            this.environment = [];
            if (_.isArray(envs)) {
                _.forEach(envs, (env) => {this.environment.push(EnvironmentVariable.parse(env))});
            } else {
                _.forOwn(envs, (val, key) => {this.environment.push(new EnvironmentVariable(key, val))});
            }
            delete serviceJson.environment;
        }

        this.warnings = [];
        _.merge(this, serviceJson);
    }

    getWarnings(policy) {
        let warnings = this.warnings = [];
        _.forOwn(this, (field, fieldName) => {

            _.forEach(policy[fieldName], (violation) => {
                const warning = this._createWarning(violation, fieldName, field);
                if(warning){
                    warning.message = `Warning: at service ${this.name}.${fieldName}`;
                    warning.path = fieldName;
                    this.warnings.push(warning);
                }
            });

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
                });
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

    _createWarning(violation, name, value) {
        const cases = {
            'NOT_SUPPORTED': {
                'container_name': () => {
                    const warning = new Warning(violation.name, value, 'Remove field');
                    warning.autoFix = true;
                    return warning;
                },
                'build': () => {
                    const warning = new Warning(violation.name, value, 'Replace with image');
                    warning.autoFix = true;
                    return warning;
                }
            }
        };
        if(cases[violation.name] && cases[violation.name][name]) {
            return cases[violation.name][name](value);
        }
        return;
    }

    fixWarnings() {

        _.forOwn(this, (field, fieldName) => {

            if(fieldName === 'warnings') {
                _.forEach(field, (warning) => {
                    this.actOnWarning(warning);
                });
            }

            if (_.isArray(field) && field[0] instanceof Base) {
                _.forEach(field, (value) => {
                    if (value.warnings.length > 0) {
                        value.fixWarnings();
                    }
                });
            }
            else if (field instanceof Base && field.warning) {
                field.fixWarnings();
            }
        });
    }

    addLabel(key, value) {
        if (!this.labels) {
            this.labels = [];
        }
        this.labels.push(new Label(key, value));
    }

    addPort(target, source, protocol) {
        if (!this.ports) {
            this.ports = [];
        }
        this.ports.push(new Port(target, source, protocol));
    }

    addVolume(target, source, accessMode) {
        if (!this.volumes) {
            this.volumes = [];
        }
        this.volumes.push(new Volume(target, source, accessMode));
    }

    addEnvironmentVariable(key, value) {
        if (!this.environments) {
            this.environments = [];
        }
        this.environments.push(new EnvironmentVariable(key, value));
    }

    actOnWarning(violation){
        const cases = {
            'NOT_SUPPORTED': {
                'container_name': () => {
                    delete this[violation.path];
                },
                'build': () => {
                    delete this[violation.path];
                    this.image = new Image('find some name', 'latest');
                }
            }

        };


        if(cases[violation.name] && cases[violation.name][violation.path]) {
            return cases[violation.name][violation.path]();
        }
        return;
    }

}

module.exports = Service;