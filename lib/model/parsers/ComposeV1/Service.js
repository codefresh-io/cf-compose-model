'use strict';

const ServiceComponent                  = require('./../../components/service/Service');
const FieldNotSupportedByOriginalParser = require('./../../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const InvalidSyntexForParser            = require('./../../errorsAndWarnings/Errors/InvalidSyntexForParser');
const Promise                           = require('bluebird'); // jshint ignore:line
const _                                 = require('lodash');
const BaseServiceParser                 = require('./../Base/Service');
const type                              = require('type-detect');

const fields = ['build',
    'dockerfile',
    'cap_app',
    'cap_drop',
    'command',
    'cgroup_parent',
    'container_name',
    'devices',
    'dns',
    'dns_search',
    'entrypoint',
    'env_file',
    'environment',
    'expose',
    'extends',
    'external_links',
    'extra_hosts',
    'image',
    'labels',
    'links',
    'log_driver',
    'log_opt',
    'net',
    'pid',
    'ports',
    'security_opt',
    'stop_signal',
    'ulimits',
    'volumes',
    'volume_driver',
    'volumes_from',
    'cpu_shares',
    'cpu_quota',
    'cpuset',
    'domainname',
    'hostname',
    'ipc',
    'mac_address',
    'mem_limit',
    'memswap_limit',
    'mem_swappiness',
    'privileged',
    'read_only',
    'restart',
    'shm_size',
    'stdin_open',
    'tty',
    'user',
    'working_dir'
];

class Service extends BaseServiceParser {

    constructor(name, value) {
        super();
        this.name = name;
        this.obj  = value;
    }

    parse(accessibility) {
        const serviceInstance = new ServiceComponent(this.name);
        const serviceObj      = this.obj;
        const serviceObjKeys  = _.keys(serviceObj);
        serviceInstance.setOrder(serviceObjKeys);
        return Promise.map(serviceObjKeys, (fieldName) => {
            const fieldValue = serviceObj[fieldName];
            const cases      = {
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
                        const suggestion = `image: ${serviceInstance.getName()}`;
                        const warning    = this._createWarningFieldNotSupportedByPolicy({
                            fieldName,
                            fieldValue,
                            serviceName: serviceInstance.getName(),
                            suggestion,
                            autoFix: true
                        });
                        serviceInstance.setAdditionalData(fieldName, warning);

                    } else {
                        serviceInstance.setAdditionalData(fieldName, serviceObj[fieldName]);
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
                        serviceInstance.setAdditionalData(fieldName, serviceObj[fieldName]);
                    }
                },
                'context': () => {
                    const isContextSupported = accessibility.isContextSupported();
                    if (!isContextSupported) {
                        const warning = this._createWarningFieldNotSupportedByPolicy({
                            fieldName,
                            fieldValue,
                            serviceName: serviceInstance.getName(),
                            suggestion: '',
                            autoFix: true
                        });
                        serviceInstance.setAdditionalData(fieldName, warning);
                    } else {
                        serviceInstance.setAdditionalData(fieldName, serviceObj[fieldName]);
                    }
                }
            };

            if (cases[fieldName]) {
                cases[fieldName]();
            } else {
                if (_.indexOf(fields, fieldName) < 0) {
                    const err = new FieldNotSupportedByOriginalParser(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose v1`);
                    this.errors.push(err);

                } else {
                    serviceInstance.setAdditionalData(fieldName, serviceObj[fieldName]);
                }
            }
        })
            .then(() => {
                if (_.size(this.errors) > 0) {
                    const err   = new Error('FAILED_TO_PARSE');
                    err.errors  = this.errors;
                    err._service = serviceInstance;
                    throw err;
                }
                return serviceInstance;
            });
    }


}


module.exports = Service;
