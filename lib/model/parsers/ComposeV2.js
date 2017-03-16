'use strict';

const _              = require('lodash');
const CFComposeModel = require('./../CFComposeModel');
const components     = require('./../components');
const Promise        = require('bluebird');
const Service        = components.Service;
const Network        = components.Network;
const Volume         = components.Volume;

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

        //get all the services
        const yamlServices = yaml.services || {};
        const yamlNetworks = yaml.networks || {};
        const yamlVolumes  = yaml.volumes || {};

        const yamlServicesKeys = Object.keys(yamlServices);
        const yamlNetworksKeys = Object.keys(yamlNetworks);
        const yamlVolumesKeys  = Object.keys(yamlVolumes);


        return Promise.map(yamlServicesKeys, (serviceName) => {
            const serviceInstance = new Service(serviceName);
            const serviceObject   = yamlServices[serviceName];
            const serviceKeys     = Object.keys(serviceObject);
            return Promise.map(serviceKeys, (fieldName) => {
                const fieldValue = serviceObject[fieldName];
                const cases      = {
                    'image': () => {
                        if (!_.isString(fieldValue)) {
                            throw new Error('Image must be a string');
                        }
                        serviceInstance.setImage(fieldValue);
                    },
                    'ports': () => {
                        if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                            throw new Error('Ports must be array or object');
                        }

                        if (_.isArray(fieldValue)) {
                            _.forEach(fieldValue, (port) => {
                                serviceInstance.addPort(port);
                            });
                        } else {
                            _.forOwn(fieldValue, (port) => {
                                serviceInstance.addPort(port);
                            });
                        }
                    },
                    'volumes': () => {
                        if (!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)) {
                            throw new Error('Volumes must be array or object');
                        }

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
                };

                if (cases[fieldName]) {
                    cases[fieldName]();
                } else {
                    if (fields.service.indexOf(fieldName) < 0) {
                        throw new Error(`Field '${fieldName}' not supported by compose v2 under services`);
                    }
                    serviceInstance.setAdditionalData(fieldName, fieldValue);
                }
            })
                .then(() => {
                    return serviceInstance;
                })
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
                        if(fields.network.indexOf(fieldName) < 0){
                            throw new Error(`Field '${fieldName}' not supported by compose v2 under networks`);
                        }
                        networkInstance.setAdditionalData(fieldName, fieldValue);
                    })
                        .then(() => {
                            return networkInstance;
                        })
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
                        if(fields.volume.indexOf(fieldName) < 0){
                            throw new Error(`Field '${fieldName}' not supported by compose v2 under volumes`);
                        }
                        volumeInstance.setAdditionalData(fieldName, fieldValue);
                    })
                        .then(() => {
                            return volumeInstance;
                        })
                })
                    .map((network) => {
                        compose.addVolume(network);
                    });
            })
            .then(() => {
                return compose;
            })




        // _.forOwn(yamlServices, (serviceObj, serviceName) => {
        //     const serviceInstance = new Service(serviceName);
        //     _.forOwn(serviceObj, (fieldValue, fieldName) => {
        //         const cases = {
        //             'image': () => {
        //                 if(!_.isString(fieldValue)){
        //                     throw new Error('Image must be a string');
        //                 }
        //                 serviceInstance.setImage(fieldValue);
        //             },
        //             'ports': () => {
        //                 if(!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)){
        //                     throw new Error('Ports must be array or object');
        //                 }
        //
        //                 if (_.isArray(fieldValue)) {
        //                     _.forEach(fieldValue, (port) => {
        //                         serviceInstance.addPort(port);
        //                     });
        //                 } else {
        //                     _.forOwn(fieldValue, (port) => {
        //                         serviceInstance.addPort(port);
        //                     });
        //                 }
        //             },
        //             'volumes': () => {
        //                 if(!_.isArray(fieldValue) && !_.isPlainObject(fieldValue)){
        //                     throw new Error('Volumes must be array or object');
        //                 }
        //
        //                 if (_.isArray(fieldValue)) {
        //                     _.forEach(fieldValue, (volume) => {
        //                         serviceInstance.addVolume(volume);
        //                     });
        //                 } else {
        //                     _.forOwn(fieldValue, (volume) => {
        //                         serviceInstance.addVolume(volume);
        //                     });
        //                 }
        //             }
        //         };
        //
        //         if (cases[fieldName]) {
        //             cases[fieldName]();
        //         } else {
        //             if(fields.service.indexOf(fieldName) < 0){
        //                 throw new Error(`Field '${fieldName}' not supported by compose v2 under services`);
        //             }
        //             serviceInstance.setAdditionalData(fieldName, fieldValue);
        //         }
        //     });
        //
        //     compose.addService(serviceInstance);
        // });
        // //get all the networks
        // const yamlNetworks = yaml.networks || {};
        // _.forOwn(yamlNetworks, (networkObj, networkName) => {
        //     const networkInstance = new Network(networkName);
        //     _.forOwn(networkObj, (fieldValue, fieldName) => {
        //         if(fields.network.indexOf(fieldName) < 0){
        //             throw new Error(`Field '${fieldName}' not supported by compose v2 under networks`);
        //         }
        //         networkInstance.setAdditionalData(fieldName, fieldValue);
        //     });
        //     compose.addNetwork(networkInstance);
        // });
        // //get all the volumes
        // const yamlVolumes = yaml.volumes || {};
        // _.forOwn(yamlVolumes, (volumeObj, volumeName) => {
        //     const volumeInstance = new Volume(volumeName);
        //     _.forOwn(volumeObj, (fieldValue, fieldName) => {
        //         if(fields.volume.indexOf(fieldName) < 0){
        //             throw new Error(`Field '${fieldName}' not supported by compose v2 under volumes`);
        //         }
        //         volumeInstance.setAdditionalData(fieldName, fieldValue);
        //     });
        //     compose.addVolume(volumeInstance);
        // });
        // return compose;
    }
}

module.exports = ComposeV2;