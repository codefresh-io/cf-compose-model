'use strict';
const _       = require('lodash');
const Port    = require('./Port');
const Volume  = require('./ServiceVolume');
const Image   = require('./Image');
const Warning = require('./../ComposeWarning');
const Base      = require('./base').Base;


class Service extends Base {

    /**
     * @param serviceName | String - the name of the service
     * @param data | Object - all the service data as build,image
     */
    constructor(serviceName, data) {
        super(serviceName);
        data              = data || {};
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
            this.setImage(data.image);
            delete serviceJson.image;
        }

        this.warnings = [];
        _.merge(this, serviceJson);
    }

    /**
     * Return all the warnings related to the policy of the service with all the warnings of all the service components
     * @param policy
     * @return {Array}
     */
    getWarnings(policy) {
        this.warnings = [];

        _.forOwn(this, (field, fieldName) => {

            _.forEach(policy[fieldName], (violation) => {
                const warning = this._createWarning(violation, fieldName, field);
                if (warning) {
                    warning.message = `Warning: at service ${this.getName()}.${fieldName}`;
                    warning.path    = fieldName;
                    this.warnings.push(warning);
                }
            });

            if (fieldName !== 'warnings' && fieldName !== '_name') {
                if (_.isArray(field)) {
                    _.forEach(field, (value) => {
                        if (value instanceof Base) {
                            const warningsArr = value.getWarnings(policy[value.getName()]);
                            if (warningsArr && warningsArr.length) {
                                _.forEach(warningsArr, (warning) => {
                                    warning.message =
                                        `Warning: at service ${this.getName()}.${fieldName}`;
                                    this.warnings.push(warning);
                                });
                            }
                        }
                    });
                } else {
                    if (field instanceof Base) {
                        const warningsArr = field.getWarnings(policy[field.getName()]);
                        _.forEach(warningsArr, (warning) => {
                            warning.message = `Warning: at service ${this.getName()}.${fieldName}`;
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

    /**
     *
     * @param onlyAutoFix | Boolean - fix all warnings in the service
     */
    fixWarnings(onlyAutoFix) {

        _.forOwn(this, (field, fieldName) => {

            if (fieldName === 'warnings') {
                _.forEach(field, (warning) => {
                    if (!onlyAutoFix || (onlyAutoFix && warning.autoFix)) {
                        this._fixWarning(warning);
                    }
                });
            }

            if (_.isArray(field) && (field[0] instanceof Base)) {
                _.forEach(field, (value) => {
                    if (value.warnings.length > 0) {
                        value.fixWarnings(onlyAutoFix);
                    }
                });
            }
            else if (field instanceof Base) {
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
        if (!(port instanceof Port)) {
            throw Error('Not instanceof Port');
        }
        if (!this.ports) {
            this.ports = [];
        }
        this.ports.push(port);
    }

    addVolume(volume) {
        if (!(volume instanceof Volume)) {
            throw Error('Not instanceof Volume');
        }
        if (!this.volumes) {
            this.volumes = [];
        }
        this.volumes.push(volume);
    }

    setImage(image) {
        if (!(image instanceof Image)) {
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

    _fixWarning(violation) {
        const cases = {
            'NOT_SUPPORTED': {
                'container_name': () => {
                    delete this[violation.path];
                },
                'build': () => {
                    delete this[violation.path];
                    this.image = new Image()
                        .setRepo(this.getName())
                        .setTag('latest');
                }
            }

        };


        if (cases[violation.name] && cases[violation.name][violation.path]) {
            return cases[violation.name][violation.path]();
        }
        return;
    }

    get(fields) {
        const imageIndex   = fields.indexOf('image');
        if (imageIndex) {
            fields.splice(imageIndex, 1);
        }
        const volumesIndex = fields.indexOf('volumes');
        if (volumesIndex) {
            fields.splice(volumesIndex, 1);
        }
        const portsIndex   = fields.indexOf('ports');
        if (portsIndex) {
            fields.splice(portsIndex, 1);
        }

        return super.get(fields);
    }

    getImage(){
        return this.image;
    }

    getPorts(){
        return this.ports;
    }

    getVolumes(){
        return this.volumes;
    }

}

module.exports = Service;