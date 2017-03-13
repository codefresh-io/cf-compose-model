'use strict';

const _      = require('lodash');
const YAML   = require('yamljs');
const Base   = require('./Base');

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
        'priviliged',
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
        const jsonServices = json['services'] = {};
        _.forEach(services, (serviceInstance, serviceName) => {
            const service = jsonServices[serviceName] = {};
            const allFields = serviceInstance.get(fields.service);
            const image     = serviceInstance.getImage();
            const ports     = serviceInstance.getPorts();
            const volumes   = serviceInstance.getVolumes();

            if (image) {
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

            if (ports && ports.length > 0) {
                const portsArray = service['ports'] = [];
                _.forEach(ports, (port) => {
                    let portString = ``;
                    const source   = port.getSource();
                    const target   = port.getTarget();
                    const protocol = port.getProtocol();

                    if (source) {
                        portString += `${source}:`;
                    }
                    portString += `${target}`;
                    if (protocol) {
                        portString += `/${protocol}`;
                    }
                    portsArray.push(portString);
                });
            }

            if (volumes && volumes.length > 0) {
                const volumesArray = service['volumes'] = [];
                _.forEach(volumes, (volume) => {
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
                });
            }

            _.merge(service, allFields);

        });


        const volumes = compose.getAllVolumes();
        if (!_.isEmpty(volumes)) {
            const jsonVolumes = json['volumes'] = {};
            _.forOwn(volumes, (volumeInstance, volumeName) => {
                const volume = jsonVolumes[volumeName] = {};
                const allFields = volumeInstance.get(fields.volume);
                _.merge(volume, allFields);
            });
        }

        const networks = compose.getAllNetworks();
        if (!_.isEmpty(networks)) {
            const jsonNetworks = json['networks'] = {};
            _.forOwn(networks, (networkInstance, networkName) => {
                const network = jsonNetworks[networkName] = {};
                const allFields = networkInstance.get(fields.network);
                _.merge(network, allFields);
            });
        }
        return YAML.stringify(json, 4, 2);

    }

}

module.exports = new ComposeV2();