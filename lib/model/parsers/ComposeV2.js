'use strict';

const type           = require('type-detect');
const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');
const Promise        = require('bluebird'); // jshint ignore:line
const Service        = components.Service;
const Network        = components.Network;
const Volume         = components.Volume;
const ErrorComponent = components.ErrorComponent;

const fields = {
    service: ['build',
        'cap_app',
        'cap_drop',
        'command',
        'cgroup_parent',
        'container_name',
        'devices',
        'depends_on',
        'dns',
        'dns_search',
        'tmpfs',
        'entrypoint',
        'env_file',
        'environment',
        'expose',
        'extends',
        'external_links',
        'extra_hosts',
        'group_add',
        'image',
        'labels',
        'links',
        'logging',
        'log_opt',
        'network_mode',
        'networks',
        'pid',
        'ports',
        'security_opt',
        'stop_grace_period',
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
        'oom_score_adj',
        'privileged',
        'read_only',
        'restart',
        'shm_size',
        'stdin_open',
        'tty',
        'user',
        'working_dir'
    ],
    network: ['driver', 'driver_opts', 'external', 'ipam', 'internal', 'external'],
    volume: ['driver', 'driver_opts', 'external']
};

class ComposeV2 {
    static parse(yaml) {
        const compose = new CFComposeModel(yaml);
        const order   = _.keys(yaml);
        order.splice(0, 1); //remove the version from the order
        compose.setGlobalOrder(order);
        //get all the services
        const yamlServices = yaml.services || {};
        const yamlNetworks = yaml.networks || {};
        const yamlVolumes  = yaml.volumes || {};

        const yamlServicesKeys = _.keys(yamlServices);
        compose.setServicesOrder(yamlServicesKeys);
        const yamlNetworksKeys = _.keys(yamlNetworks);
        compose.setNetworksOrder(yamlNetworksKeys);
        const yamlVolumesKeys = _.keys(yamlVolumes);
        compose.setVolumesOrder(yamlVolumesKeys);


        return Promise.map(yamlServicesKeys, (serviceName) => {
            const serviceInstance = new Service(serviceName);
            const serviceObject   = yamlServices[serviceName];
            const serviceKeys     = Object.keys(serviceObject);
            return Promise.map(serviceKeys, (fieldName) => {
                const fieldValue = serviceObject[fieldName];
                const cases      = {
                    'image': () => {
                        if (!_.isString(fieldValue)) {
                            const err = new ErrorComponent(fieldName, fieldValue, `Image must be string, got ${type(fieldValue)}`);
                            serviceInstance.setImage(err);
                        } else {
                            serviceInstance.setImage(fieldValue);
                        }
                    },
                    'ports': () => {
                        if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                            const err = new ErrorComponent(fieldName, fieldValue, `Ports must be array or object, got ${type(fieldValue)}`);
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
                            const err = new ErrorComponent(fieldName, fieldValue, `Volumes must be array or object, got ${type(fieldValue)}`);
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
                    }
                };

                if (cases[fieldName]) {
                    cases[fieldName]();
                } else {
                    if (_.indexOf(fields.service, fieldName) < 0) {
                        const err = new ErrorComponent(fieldName, fieldValue, `Field '${fieldName}' is not supported by compose v2 under services`);
                        serviceInstance.setAdditionalData(fieldName, err);
                    } else {
                        serviceInstance.setAdditionalData(fieldName, fieldValue);
                    }
                }
            })
                .then(() => {
                    return serviceInstance;
                });
        })
            .map((service) => {
                compose.addService(service);
            })
            .then(() => {
                return Promise.map(yamlNetworksKeys, (networkName) => {
                    const networkInstance = new Network(networkName);
                    const networkObject   = yamlNetworks[networkName];
                    const networkKeys     = Object.keys(networkObject);
                    return Promise.map(networkKeys, (fieldName) => {
                        const fieldValue = networkObject[fieldName];
                        if (fields.network.indexOf(fieldName) < 0) {
                            throw new Error(`Field '${fieldName}' not supported by compose v2 under networks`);
                        }
                        networkInstance.setAdditionalData(fieldName, fieldValue);
                    })
                        .then(() => {
                            return networkInstance;
                        });
                })
                    .map((network) => {
                        compose.addNetwork(network);
                    });
            })
            .then(() => {
                return Promise.map(yamlVolumesKeys, (volumeName) => {
                    const volumeInstance = new Volume(volumeName);
                    const volumeObject   = yamlVolumes[volumeName];
                    const volumeKeys     = Object.keys(volumeObject);
                    return Promise.map(volumeKeys, (fieldName) => {
                        const fieldValue = volumeObject[fieldName];
                        if (fields.volume.indexOf(fieldName) < 0) {
                            throw new Error(`Field '${fieldName}' not supported by compose v2 under volumes`);
                        }
                        volumeInstance.setAdditionalData(fieldName, fieldValue);
                    })
                        .then(() => {
                            return volumeInstance;
                        });
                })
                    .map((network) => {
                        compose.addVolume(network);
                    });
            })
            .then(() => {
                return compose;
            });

    }
}

module.exports = ComposeV2;