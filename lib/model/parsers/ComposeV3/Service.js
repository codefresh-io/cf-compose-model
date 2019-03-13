'use strict';

const InvalidSyntexForParser            = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const _                                 = require('lodash');
const ServiceParser                     = require('./../Base/Service');
const type                              = require('type-detect');

class Service extends ServiceParser {

    constructor(name, value) {
        super(name, value);
        this.specialFields = this.specialFields.concat([
            'tmpfs',
            'network_mode',
            'stop_grace_period',
            'sysctls',
            'network'
        ]);
        this.supportedFields = this.supportedFields.concat([
            'deploy',
            'depends_on',
            'tmpfs',
            'group_add',
            'healthcheck',
            'isolation',
            'logging',
            'network_mode',
            'networks',
            'secrets',
            'stop_grace_period',
            'sysctls'
        ]);
    }

    _actOnSpecialField(serviceInstance, fieldName, fieldValue){
        const accessibility = this.accessibility;

        const cases = {
            'image': () => {
                try {
                    const image = this.attemptToCreateImage(fieldName, fieldValue);
                    serviceInstance.setImage(image);
                } catch (err) {
                    this.errors.push(err);
                }
            },
            'ports': () => {
                if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                    const err = new InvalidSyntexForParser(fieldName, fieldValue, `Ports must be array or object, got ${type(
                        fieldValue)}`);
                    this.errors.push(err);
                }
                else {
                    if (_.isArray(fieldValue)) {
                        serviceInstance.setPortsOriginalType('Array');
                        _.forEach(fieldValue, (port) => {
                            try {
                                const portInstance = this.attemptToCreatePort(fieldName, port);
                                serviceInstance.addPort(portInstance);
                            } catch (err) {
                                this.errors.push(err);
                            }
                        });
                    } else {
                        // Its object, compose v1 not supporting in this way pass only the target
                        serviceInstance.setPortsOriginalType('Object');
                        _.forOwn(fieldValue, (target, source) => {
                            try {
                                const portInstance = this.attemptToCreatePort(fieldName,
                                    `${source}:${target}`);
                                serviceInstance.addPort(portInstance);
                            } catch (err) {
                                this.errors.push(err);
                            }
                        });
                    }
                }
            },
            'volumes': () => {
                if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                    const err = new InvalidSyntexForParser(fieldName, fieldValue, `Volumes must be array or object, got ${type(
                        fieldValue)}`);
                    this.errors.push(err);
                }
                else {
                    if (_.isArray(fieldValue)) {
                        serviceInstance.setVolumesOriginalType('Array');
                        _.forEach(fieldValue, (volume) => {
                            try {
                                const volumeInstance = this.attemptToCreateVolume(fieldName,
                                    volume);
                                serviceInstance.addVolume(volumeInstance);
                            } catch (err) {
                                this.errors.push(err);
                            }
                        });
                    } else {
                        serviceInstance.setVolumesOriginalType('Object');
                        _.forOwn(fieldValue, (target, source) => {
                            try {
                                const volumeInstance = this.attemptToCreateVolume(fieldName,
                                    `${source}:${target}`);
                                serviceInstance.addVolume(volumeInstance);
                            } catch (err) {
                                this.errors.push(err);
                            }
                        });
                    }
                }
            },
            'build': () => {
                const isBuildSupported = accessibility.isBuildSupported();
                if (!isBuildSupported) {
                    const suggestion = `Replace build property with image`;
                    const warning    = this._createWarningFieldNotSupportedByPolicy({
                        fieldName,
                        fieldValue,
                        serviceName: serviceInstance.getName(),
                        suggestion,
                        autoFix: false,
                        requireManuallyFix: true
                    });
                    serviceInstance.setAdditionalData(fieldName, warning);

                } else {
                    serviceInstance.setAdditionalData(fieldName, fieldValue);
                }

            },
            'container_name': () => {
                const isContainerNameSupported = accessibility.isContainerNameSupported();
                if (!isContainerNameSupported) {
                    const suggestion = `Field not supported , avoid using "${fieldName}"`;
                    const warning    = this._createWarningFieldNotSupportedByPolicy({
                        fieldName,
                        fieldValue,
                        serviceName: serviceInstance.getName(),
                        suggestion,
                        autoFix: true
                    });
                    serviceInstance.setAdditionalData(fieldName, warning);
                } else {
                    serviceInstance.setAdditionalData(fieldName, fieldValue);
                }
            }
        };
        try {
            return super._actOnSpecialField(serviceInstance, fieldName, fieldValue);
        } catch(err){
            return cases[fieldName](fieldValue);
        }
    }
}


module.exports = Service;
