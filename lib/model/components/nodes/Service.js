'use strict';
const _       = require('lodash');
const Port    = require('./../leafs/Port');
const Volume  = require('./../leafs/Volume');
const Image   = require('./../leafs/Image');
const Warning = require('./../../ComposeWarning');
const Leaf    = require('./../base').CFLeaf;
const Node    = require('./../base').CFNode;
console.log(Port)

/**
 * name: name of the service
 */

class Service extends Node {

    constructor(serviceName, data) {
        super(serviceName);
        const serviceJson = _.cloneDeep(data) || {};

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

        this.warnings = [];
        _.merge(this, serviceJson);
    }

    getWarnings(policy) {
        this.warnings = [];

        _.forOwn(this, (field, fieldName) => {

            _.forEach(policy[fieldName], (violation) => {
                const warning = this._createWarning(violation, fieldName, field);
                if (warning) {
                    warning.message = `Warning: at service ${this.name}.${fieldName}`;
                    warning.path    = fieldName;
                    this.warnings.push(warning);
                }
            });

            if (_.isArray(field)) {
                _.forEach(field, (value) => {
                    if (value instanceof Leaf) {
                        const warningsArr = value.getWarnings(policy);
                        if (warningsArr && warningsArr.length) {
                            _.forEach(warningsArr, (warning) => {
                                warning.message = `Warning: at service ${this.name}.${fieldName}`;
                                value.warnings.push(warning);
                                this.warnings.push(warning);
                            });
                        }
                    }
                });
            } else {
                if (field instanceof Leaf) {
                    const warningsArr = field.getWarnings(policy);
                    _.forEach(warningsArr, (warning) => {
                        warning.message = `Warning: at service ${this.name}.${fieldName}`;
                        field.warnings.push(warning);
                        this.warnings.push(warning);
                    });
                }
            }
        });

        return this.warnings;
    }

    _createWarning(violation, name, value) {
        const cases = {
            'NOT_SUPPORTED': {
                'container_name': () => {
                    const warning   = new Warning(violation.name, value, 'Remove field');
                    warning.autoFix = true;
                    return warning;
                },
                'build': () => {
                    const warning   = new Warning(violation.name, value, 'Replace with image');
                    warning.autoFix = true;
                    return warning;
                }
            }
        };
        if (cases[violation.name] && cases[violation.name][name]) {
            return cases[violation.name][name](value);
        }
        return;
    }

    fixWarnings(onlyAutoFix) {

        _.forOwn(this, (field, fieldName) => {

            if (fieldName === 'warnings') {
                _.forEach(field, (warning) => {
                    if((onlyAutoFix && warning.autoFix) || !onlyAutoFix) {
                        this.actOnWarning(warning);
                    }
                });
            }

            if (_.isArray(field) && (field[0] instanceof Leaf)) {
                _.forEach(field, (value) => {
                    if (value.warnings.length > 0) {
                        value.fixWarnings();
                    }
                });
            }
            else if ((field instanceof Leaf )&& field.warning) {
                field.fixWarnings();
            }
        });
    }

    addLabel(key, value) {
        if (!this.labels) {
            this.labels = [];
        }
        if (_.isArray(this.labels)) {
            this.labels.push(`${key}=${value}`);
        } else {
            this.labels[key] = value;
        }
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
        if (!this.environment) {
            this.environment = [];
        }

        if (_.isArray(this.environment)) {
            this.environment.push(`${key}=${value}`);
        } else {
            this.environment[key] = value;
        }
    }

    actOnWarning(violation) {
        const cases = {
            'NOT_SUPPORTED': {
                'container_name': () => {
                    delete this[violation.path];
                },
                'build': () => {
                    delete this[violation.path];
                    this.image = new Image(undefined, this.name, 'latest');
                }
            }

        };


        if (cases[violation.name] && cases[violation.name][violation.path]) {
            return cases[violation.name][violation.path]();
        }
        return;
    }

}

module.exports = Service;