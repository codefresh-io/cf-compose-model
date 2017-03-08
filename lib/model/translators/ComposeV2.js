'use strict';

const _              = require('lodash');
const CFLeaf        = require('./../components/base').CFLeaf;


class ComposeV2 {

    static translate(compose) {
        let json = {
            version: '2'
        };

        json['services'] = {};
        const services = compose.services;
        _.forOwn(services, (serviceInstance) => {
            const service = json['services'][serviceInstance.name] = {};

            _.forOwn(serviceInstance.toJson(), (fieldObj, fieldName) => {
                if (_.isArray(fieldObj)){
                    const res = [];
                    _.forEach(fieldObj, (value) => {
                        if(value instanceof CFLeaf){
                            res.push(value.toString());
                        } else {
                            res.push(value);
                        }
                    });
                    service[fieldName] = res;
                } else {
                    if(fieldObj instanceof CFLeaf){
                        service[fieldName] = fieldObj.toString();
                    } else {
                        service[fieldName] = fieldObj;
                    }
                }
            });

        });


        if(Object.keys(compose.volumes).length){
            const volumes = compose.volumes;
            json['volumes'] = {};
            _.forOwn(volumes, (volumesInstance) => {
                const volume = json['volumes'][volumesInstance.name] = {};
                _.forOwn(volumesInstance.toJson(), (field, fieldName) => {
                    volume[fieldName] = field;
                });
            });
        }

        if(Object.keys(compose.networks).length){
            const networks = compose.networks;
            json['networks'] = {};
            _.forOwn(networks, (networkInstance) => {
                const network = json['networks'][networkInstance.name] = {};
                _.forOwn(networkInstance.toJson(), (field, fieldName) => {
                    network[fieldName] = field;
                });
            });
        }

        return json;
    }

}

module.exports = ComposeV2;