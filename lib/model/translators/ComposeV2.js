'use strict';

const _              = require('lodash');
const BaseComponent  = require('./../components').BaseComponenet;

class ComposeV2 {

    static translate(compose) {
        let json = {
            version: '2'
        };

        json['services'] = {};
        const services = compose.services;
        _.forOwn(services, (serviceInstance) => {
            const service = json['services'][serviceInstance.name] = {};

            _.forOwn(serviceInstance, (fieldObj, fieldName) => {
                if(fieldName === 'name'){
                    return;
                }
                if (_.isArray(fieldObj)){
                    const res = [];
                    _.forEach(fieldObj, (value) => {
                        if(value instanceof BaseComponent){
                            if(_.get(value, 'warning.autoFix', false)){
                                const newValue = ComposeV2.actOnWarning(value);
                                if(newValue){
                                    res.push(newValue);
                                }
                            } else {
                                res.push(value.toString());
                            }
                        } else {
                            res.push(value);
                        }
                    });

                    service[fieldName] = res;
                } else {
                    if(fieldObj instanceof BaseComponent){
                        if(_.get(fieldObj, 'warning.autoFix', false)){
                            const newValue = ComposeV2.actOnWarning(fieldObj);
                            if(newValue){
                                service[fieldName] = newValue;
                            }
                        } else {
                            service[fieldName] = fieldObj.toString();
                        }
                    } else {
                        service[fieldName] = fieldObj;
                    }
                }
            });

        });

        //add networks and volumes

        return json;
    }

    static actOnWarning(instance) { // jshint ignore:line
        // const cases = {
        //     'NOT_SUPPORTED': () => {} //do nothing
        // }; // jshint ignore:line
    }
}

module.exports = ComposeV2;