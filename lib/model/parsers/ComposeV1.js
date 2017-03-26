'use strict';

const type                              = require('type-detect');
const _                                 = require('lodash');
const CFComposeModel                    = require('./../CFComposeModel');
const components                        = require('./../components');
const Promise                           = require('bluebird'); // jshint ignore:line
const FieldNotSupportedByOriginalParser = require(
    './../errorsAndWarnings/Errors/FieldNotSupportedByOriginalParser');
const InvalidSyntexForParser            = require(
    './../errorsAndWarnings/Errors/InvalidSyntexForParser');
const FieldNotSupportedByPolicy         = require(
    './../errorsAndWarnings/Warnings/FieldNotSupportedByPolicy');

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



class ComposeV1 {
    static parse(yaml, policy) {
        const compose = new CFComposeModel(yaml);
        if (policy) {
            compose.setPolicy(policy);
        }
        const serviceKeys   = _.keys(yaml);
        const accessibility = compose.getServicesAccessibility();
        return Promise.map(serviceKeys, (serviceName) => {
            const serviceObj      = yaml[serviceName];
            const serviceInstance = new components.Service(serviceName);
            const keys            = _.keys(serviceObj);
            serviceInstance.setOrder(keys);
            return Promise.map(keys, (fieldName) => {

                function createWarningFieldNotSupportedByPolicy({ fieldName, fieldValue, serviceInstance, suggestion, autoFix }) {
                    const warning = new FieldNotSupportedByPolicy(fieldName, fieldValue, suggestion, `Warning: at service ${serviceInstance.getName()}.${fieldName}`);
                    if (autoFix) {
                        warning.setAutoFix();
                    }
                    serviceInstance.setAdditionalData(fieldName, warning);
                }

                const fieldValue = serviceObj[fieldName];
                const cases      = {
                    'image': () => {
                        if (!_.isString(fieldValue)) {
                            const err = new InvalidSyntexForParser(fieldName, fieldValue, `Image must be string, got ${type(
                                fieldValue)}`);
                            serviceInstance.setImage(err);
                        } else {
                            serviceInstance.setImage(fieldValue);
                        }
                    },
                    'ports': () => {
                        if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                            const err = new InvalidSyntexForParser(fieldName, fieldValue, `Ports must be array or object, got ${type(
                                fieldValue)}`);
                            serviceInstance.addPort(err);
                        }
                        else {
                            if (_.isArray(fieldValue)) {
                                serviceInstance.setPortsOriginalType('Array');
                                _.forEach(fieldValue, (port) => {
                                    serviceInstance.addPort(port);
                                });
                            } else {
                                // Its object, compose v1 not supporting in this way pass only the target
                                serviceInstance.setPortsOriginalType('Object');
                                _.forOwn(fieldValue, (target, source) => {
                                    serviceInstance.addPort(`${source}:${target}`);
                                });
                            }
                        }
                    },
                    'volumes': () => {
                        if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                            const err = new InvalidSyntexForParser(fieldName, fieldValue, `Volumes must be array or object, got ${type(
                                fieldValue)}`);
                            serviceInstance.addVolume(err);
                        }

                        else {
                            if (_.isArray(fieldValue)) {
                                serviceInstance.setVolumesOriginalType('Array');
                                _.forEach(fieldValue, (volume) => {
                                    serviceInstance.addVolume(volume);
                                });
                            } else {
                                serviceInstance.setVolumesOriginalType('Object');
                                _.forOwn(fieldValue, (target, source) => {
                                    serviceInstance.addVolume(`${source}:${target}`);
                                });
                            }
                        }
                    },
                    'build': () => {
                        const isBuildSupported = accessibility.isBuildSupported();
                        if (!isBuildSupported) {
                            const suggestion = `image: ${serviceInstance.getName()}`;
                            createWarningFieldNotSupportedByPolicy({
                                fieldName,
                                fieldValue,
                                serviceInstance,
                                suggestion,
                                autoFix: true
                            });
                        } else {
                            serviceInstance.setAdditionalData(fieldName, serviceObj[fieldName]);
                        }

                    },
                    'container_name': () => {
                        const isContainerNameSupported = accessibility.isContainerNameSupported();

                        if(!isContainerNameSupported) {
                            const suggestion = `Field not supported , avoid using "${fieldName}"`;
                            createWarningFieldNotSupportedByPolicy({
                                fieldName,
                                fieldValue,
                                serviceInstance,
                                suggestion,
                                autoFix: true
                            });
                        } else {
                            serviceInstance.setAdditionalData(fieldName, serviceObj[fieldName]);
                        }
                    },
                    'context': () => {
                        const isContextSupported = accessibility.isContextSupported();
                        if(!isContextSupported) {
                            createWarningFieldNotSupportedByPolicy({
                                fieldName,
                                fieldValue,
                                serviceInstance,
                                suggestion: '',
                                autoFix: true
                            });
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
                        serviceInstance.setAdditionalData(fieldName, err);

                    } else {
                        serviceInstance.setAdditionalData(fieldName, serviceObj[fieldName]);
                    }
                }
            })
                .then(() => {
                    return serviceInstance;
                });
        })
            .map(service => {
                compose.addService(service);
            })
            .then(() => {
                return compose;
            });
    }
}

module.exports = ComposeV1;