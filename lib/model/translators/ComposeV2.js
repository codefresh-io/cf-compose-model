'use strict';

const _          = require('lodash');
const YAML       = require('yamljs');
const Base       = require('./Base');
const Promise    = require('bluebird'); // jshint ignore:line
const components = require('./../components');

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

class ComposeV2 extends Base {

    translate(compose) {
        let json = {
            version: '2'
        };

        const services     = compose.getAllServices();
        const serviceKeys  = compose.getServicesOrder();
        const jsonServices = json['services'] = {};

        return Promise.map(serviceKeys, (serviceName) => {
            const serviceInstance = compose.getServiceByName(serviceName);
            if (!serviceInstance) {
                throw Error('Not found'); // TODO : remove
            }
            const service = jsonServices[serviceName] = {};
            const allFields = serviceInstance.get(fields.service);
            const image     = serviceInstance.getImage();
            const ports     = serviceInstance.getPorts();
            const volumes   = serviceInstance.getVolumes();

            if (image) {
                if (image instanceof components.ErrorComponent) {
                    service['image'] = image.getData();
                } else {
                    let imageString = ``;
                    const repo      = image.getRepo();
                    const tag       = image.getTag();
                    const owner     = image.getOwner();

                    if (owner) {
                        imageString += `${owner}/`;
                    }
                    imageString += `${repo}`;
                    if (tag) {
                        imageString += `:${tag}`;
                    }
                    service['image'] = imageString;
                }
            }

            return Promise.resolve()
                .then(() => {
                    if (ports && ports.length > 0) {
                        const type = serviceInstance.getPortsOriginalType();
                        if (type === 'Array' || serviceInstance.isBeenPortFix()) {
                            const portsArray = service['ports'] = [];
                            return Promise.map(ports, (port) => {
                                let portString = ``;
                                const source   = port.getSource();
                                const target   = port.getTarget();
                                const am       = port.getProtocol();
                                if (source) {
                                    portString += `${source}:`;
                                }
                                portString += `${target}`;
                                if (am) {
                                    portString += `${am}`;
                                }
                                portsArray.push(portString);
                            })
                                .then(() => {
                                    service['ports'] = portsArray;
                                });
                        } else {
                            // Is object
                            const portsObject = service['ports'] = {};
                            return Promise.map(ports, (port) => {
                                const source     = port.getSource();
                                const target     = port.getTarget();
                                const protocol   = port.getProtocol();
                                let targetString = target;
                                if (protocol) {
                                    targetString += `${protocol}`;
                                }

                                portsObject[source] = targetString;
                            })
                                .then(() => {
                                    service['ports'] = portsObject;
                                });
                        }
                    }
                    return;
                })
                .then(() => {
                    if (volumes && volumes.length > 0) {
                        const type = serviceInstance.getVolumesOriginalType();
                        if (type === 'Array') {

                            const volumesArray = service['volumes'] = [];
                            return Promise.map(volumes, (volume) => {
                                let volumeString = ``;
                                const source     = volume.getSource();
                                const target     = volume.getTarget();
                                const am         = volume.getAccessMode();
                                if (source) {
                                    volumeString += `${source}:`;
                                }
                                volumeString += `${target}`;
                                if (am) {
                                    volumeString += `${am}`;
                                }
                                volumesArray.push(volumeString);
                            })
                                .then(() => {
                                    service['volumes'] = volumesArray;
                                });
                        } else {
                            //Is object
                            const volumesObject = service['volumes'] = {};
                            return Promise.map(volumes, (volume) => {
                                const source     = volume.getSource();
                                const target     = volume.getTarget();
                                const am         = volume.getAccessMode();
                                let volumeString = target;
                                if (am) {
                                    volumeString += `:${am}`;
                                }

                                volumesObject[source] = volumeString;

                            })
                                .then(() => {
                                    service['volumes'] = volumesObject;
                                });
                        }
                    }
                    return;
                })
                .then(() => {
                    _.merge(service, allFields);
                });
        })
            .then(() => {
                const volumes = compose.getAllVolumes();
                if (!_.isEmpty(volumes)) {
                    const jsonVolumes = json['volumes'] = {};
                    const volumeNames = compose.getVolumesOrder();
                    return Promise.map(volumeNames, (volumeName) => {
                        const volumeInstance = compose.getVolumeByName(volumeName);
                        if (!volumeInstance) {
                            throw Error('Not found'); // TODO : remove
                        }

                        const volume = jsonVolumes[volumeName] = {};
                        const allFields = volumeInstance.get(fields.volume);
                        _.merge(volume, allFields);
                    });

                }
                return;
            })
            .then(() => {
                const networks = compose.getAllNetworks();
                if (!_.isEmpty(networks)) {
                    const jsonVolumes = json['networks'] = {};
                    const networkNames = compose.getNetworksOrder();
                    return Promise.map(networkNames, (networkName) => {
                        const networkInstance = compose.getNetworkByName(networkName);
                        if (!networkInstance) {
                            throw Error('Not found'); // TODO : remove
                        }
                        const network = jsonVolumes[networkName] = {};
                        const allFields = networkInstance.get(fields.network);
                        _.merge(network, allFields);
                    });

                }
                return;
            })
            .then(() => {
                return YAML.stringify(json, 4, 2);
            });
    }

}

module.exports = new ComposeV2();