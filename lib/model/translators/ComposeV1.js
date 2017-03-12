'use strict';

const _      = require('lodash');
const YAML   = require('yamljs');
const Base = require('./Base');

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
    'priviliged',
    'read_only',
    'restart',
    'shm_size',
    'stdin_open',
    'tty',
    'user',
    'working_dir'
];

class ComposeV1 extends Base {

    translate(compose) {
        let json = {};

        const services = compose.getAllServices();

        _.forEach(services, (serviceInstance, serviceName) => {
            const service = json[serviceName] = {};
            const allFields = serviceInstance.get(fields);
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
                    const source = volume.getSource();
                    const target = volume.getTarget();
                    const am = volume.getAccessMode();
                    if(source){
                        volumeString += `${source}:`;
                    }
                    volumeString += `${target}`;
                    if(am){
                        volumeString += `${am}`;
                    }
                    volumesArray.push(volumeString);
                });
            }

            _.merge(service, allFields);

        });
        return YAML.stringify(json, 4, 2);
    }
}

module.exports = new ComposeV1();