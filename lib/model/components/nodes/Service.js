'use strict';
const _       = require('lodash');
const Port    = require('./../leafs/Port');
const Volume  = require('./../leafs/Volume');
const Image   = require('./../leafs/Image');
const Warning = require('./../../ComposeWarning');
const Leaf    = require('./../base').CFLeaf;
const Node    = require('./../base').CFNode;

/**
 * name: name of the service
 */

class Service extends Node {

    constructor(serviceName, data) {
        super(serviceName);
        data = data || {};
        const serviceJson = _.cloneDeep(data) || {};

        if (serviceJson.ports) {

            this.ports  = [];
            const ports = data.ports;

            if (_.isArray(ports)) {
                _.forEach(ports, (port) => {
                    this.addPort(port);
                });
            } else {
                _.forOwn(ports, (port) => {
                    this.addPort(port);
                });
            }

            delete serviceJson.ports;
        }

        if (serviceJson.volumes) {
            this.volumes  = [];
            const volumes = data.volumes;

            if (_.isArray(volumes)) {
                _.forEach(volumes, (volume) => {
                    this.addVolume(volume);
                });
            } else {
                _.forOwn(volumes, (volume) => {
                    this.addVolume(volume);
                });
            }

            delete serviceJson.volumes;
        }

        if (serviceJson.image) {
            this.addImage(data.image);
            delete serviceJson.image;
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



            if(fieldName !== 'warnings' && fieldName !== 'name') {
                if (_.isArray(field)) {
                    _.forEach(field, (value) => {
                        if (value instanceof Leaf) {
                            const warningsArr = value.getWarnings(policy[value.parent]);
                            if (warningsArr && warningsArr.length) {
                                _.forEach(warningsArr, (warning) => {
                                    warning.message =
                                        `Warning: at service ${this.name}.${fieldName}`;
                                    value.warnings.push(warning);
                                    this.warnings.push(warning);
                                });
                            }
                        }
                    });
                } else {
                    if (field instanceof Leaf) {
                        const warningsArr = field.getWarnings(policy[field.parent]);
                        _.forEach(warningsArr, (warning) => {
                            warning.message = `Warning: at service ${this.name}.${fieldName}`;
                            field.warnings.push(warning);
                            this.warnings.push(warning);
                        });
                    }
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
                    if(!onlyAutoFix || (onlyAutoFix && warning.autoFix) ) {
                        this.actOnWarning(warning);
                    }
                });
            }

            if (_.isArray(field) && (field[0] instanceof Leaf)) {
                _.forEach(field, (value) => {
                    if (value.warnings.length > 0) {
                        value.fixWarnings(onlyAutoFix);
                    }
                });
            }
            else if (field instanceof Leaf ) {
                field.fixWarnings(onlyAutoFix);
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

    addPort(port) {
        if(!(port instanceof Port)) {
            throw Error('Not instanceof Port');
        }
        if (!this.ports) {
            this.ports = [];
        }
        this.ports.push(port);
    }

    addVolume(volume) {
        if(!(volume instanceof Volume)) {
            throw Error('Not instanceof Volume');
        }
        if (!this.volumes) {
            this.volumes = [];
        }
        this.volumes.push(volume);
    }

    addImage(image){
        if(!(image instanceof Image)){
            throw Error('Not instanceof Image');
        }
        this.image = image;
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
                    this.image = new Image.ImageBuilder()
                        .buildRepo(this.name)
                        .buildTag('latest')
                        .buildParent('image')
                        .build();
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