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

        return json;
    }

}

module.exports = ComposeV2;