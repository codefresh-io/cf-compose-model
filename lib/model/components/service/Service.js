'use strict';
const Promise = require('bluebird');

const _              = require('lodash');
const Port           = require('./Port');
const Volume         = require('./Volume');
const Image          = require('./Image');
const Warning        = require('../../ComposeWarning');
const Base           = require('../Base');
const ErrorComponent = require('./../ErrorComponent');


class Service extends Base {

    /**
     * @param serviceName | String - the name of the service
     * @param data | Object - all the service data as build,image
     */
    constructor(serviceName) {
        super(serviceName);
    }

    /**
     * Return all the warnings related to the policy of the service with all the warnings of all the service components
     * @param policy
     * @return {Array}
     */
    getWarnings(policy) {
        this.warnings = [];

        return Promise.resolve()
            .then(() => {
                if (this['container_name']) {
                    const warning   = new Warning('CONTAINER_NAME_NOT_SUPPORTED', this['container_name'], 'Avoid using container_name field', `Warning: at service ${this.getName()}.container_name`);
                    warning.autoFix = true;
                    this.warnings.push(warning);
                }
                return;
            })
            .then(() => {
                if (this['build'] && !policy.isBuildSupported()) {
                    const warning   = new Warning('BUILD_NOT_SUPPORTED', this['build'], 'Set image instead', `Warning: at service ${this.getName()}.build`);
                    warning.autoFix = true;
                    this.warnings.push(warning);
                }
                return;
            })
            .then(() => {
                if (this.getImage()) {
                    const warnings = this.getImage().getWarnings(policy);
                    _.forEach(warnings, warning => {
                        warning.message = `Warning: at service ${this.getName()}.image`;
                    });
                    this.warnings = this.warnings.concat(warnings);
                }
                return;
            })
            .then(() => {
                const allowPortMapping = policy.isPortMappingSupported();
                if (this.getPorts() && !allowPortMapping) {

                    const ports = this.getPorts();
                    return Promise.map(ports, (port) => {
                        return port.getWarnings()
                            .map(warning => {
                                warning.message = `Warning: at service ${this.getName()}.ports`;
                                return warning;
                            });
                    })
                        .then(warnings => {
                            return _.flatten(warnings);
                        })
                        .then(warnings => {
                            this.warnings = this.warnings.concat(warnings);
                        })
                }
            })
            .then(() => {
                const allowVolumeMapping = policy.isVolumeMappingSupported();
                if (this.getVolumes() && !allowVolumeMapping) {

                    const volumes = this.getVolumes();
                    return Promise.map(volumes, (volume) => {
                        return volume.getWarnings()
                            .map(warning => {
                                warning.message = `Warning: at service ${this.getName()}.volumes`;
                                return warning;
                            });
                    })
                        .then(warnings => {
                            return _.flatten(warnings);
                        })
                        .then(warnings => {
                            this.warnings = this.warnings.concat(warnings);
                        });

                }
            })
            .then(() => {
                return this.warnings;
            });
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
        this.ports = this.ports || [];
        if (port instanceof ErrorComponent) {
            this.ports.push(port);
        }
        else if (!(port instanceof Port)) {
            port = new Port(port);
            this.ports.push(port);
        }
        else {
            this.ports.push(port);
        }
        return this;
    }

    addVolume(volume) {
        this.volumes = this.volumes || [];
        if (volume instanceof ErrorComponent) {
            this.volumes.push(volume);
        }
        else if (!(volume instanceof Volume)) {
            volume = new Volume(volume);
            this.volumes.push(volume);
        }
        else {
            this.volumes.push(volume);
        }
        return this;
    }

    setImage(image) {
        if (image instanceof ErrorComponent) {
            this.image = image;
        }
        else if (!(image instanceof Image)) {
            image      = new Image(image);
            this.image = image;
        } else {
            this.image = image;
        }
        return this;
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

        return this;
    }

    _fixWarning(violation) {
        const cases = {
            'BUILD_NOT_SUPPORTED': () => {
                delete this['build'];
                this.image = new Image()
                    .setRepo(this.getName())
                    .setTag('latest');
            },
            'CONTAINER_NAME_NOT_SUPPORTED': () => {
                delete this['container_name'];
            }
        };


        if (cases[violation.name]) {
            return cases[violation.name]();
        }
        return;
    }

    get(fields) {
        // TODO : use lodash
        const imageIndex = fields.indexOf('image');
        if (imageIndex >= 0) {
            fields.splice(imageIndex, 1);
        }
        const volumesIndex = fields.indexOf('volumes');
        if (volumesIndex >= 0) {
            fields.splice(volumesIndex, 1);
        }
        const portsIndex = fields.indexOf('ports');
        if (portsIndex >= 0) {
            fields.splice(portsIndex, 1);
        }

        return super.get(fields);
    }

    getImage() {
        return this.image;
    }

    getPorts() {
        return this.ports;
    }

    getVolumes() {
        return this.volumes;
    }

    getErrors() {
        let res     = [];
        const image = this.getImage();
        if (image instanceof ErrorComponent) {
            res.push(image)
        }

        const ports = this.getPorts();
        return Promise.map(ports || [], (port) => {
            if (port instanceof ErrorComponent) {
                res.push(port);
            }
            return;
        })
            .then(() => {
                const volumes = this.getVolumes();
                return Promise.map(volumes || [], (volume) => {
                    if (volume instanceof ErrorComponent) {
                        res.push(volume);
                    }
                    return;
                })
            })
            .then(() => {
                return res;
            });
    }


}

module.exports = Service;