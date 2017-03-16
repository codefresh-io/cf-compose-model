'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');
const Promise        = require('bluebird'); // jshint ignore:line
const ErrorComponent = components.ErrorComponent;

const fields         = ['build',
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
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);

        return Promise.map(Object.keys(yaml), (serviceName) => {
            const serviceObj      = yaml[serviceName];
            const serviceInstance = new components.Service(serviceName);
            const keys            = Object.keys(serviceObj);
            return Promise.map(keys, (fieldName) => {
                const fieldValue = serviceObj[fieldName];
                const cases      = {
                    'image': () => {
                        if (!_.isString(fieldValue)) {
                            const err = new ErrorComponent(fieldName, fieldValue, 'Image must be string');
                            serviceInstance.setImage(err);
                        } else {
                            serviceInstance.setImage(fieldValue);
                        }
                    },
                    'ports': () => {
                        if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                            const err = new ErrorComponent(fieldName, fieldValue, 'Ports must be array or object');
                            serviceInstance.addPort(err);
                        }
                        else {
                            if (_.isArray(fieldValue)) {
                                _.forEach(fieldValue, (port) => {
                                    serviceInstance.addPort(port);
                                });
                            } else {
                                _.forOwn(fieldValue, (port) => {
                                    serviceInstance.addPort(port);
                                });
                            }
                        }
                    },
                    'volumes': () => {
                        if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                            const err = new ErrorComponent(fieldName, fieldValue, 'Volumes must be array or object');
                            serviceInstance.addVolume(err);
                        }

                        else {
                            if (_.isArray(fieldValue)) {
                                _.forEach(fieldValue, (volume) => {
                                    serviceInstance.addVolume(volume);
                                });
                            } else {
                                _.forOwn(fieldValue, (volume) => {
                                    serviceInstance.addVolume(volume);
                                });
                            }
                        }
                    }
                };

                if (cases[fieldName]) {
                    cases[fieldName]();
                } else {
                    if (_.indexOf(fields, fieldName) < 0) {
                        const err = new ErrorComponent(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose v1`);
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