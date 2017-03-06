'use strict';

const _              = require('lodash');
const BaseComponent = require('./../components').BaseComponenet;

class ComposeV1 {

    static translate(compose) {
        let json = {};

        const service = compose.services;

        _.forOwn(service, (service, name) => {

            json[name] = {};
            _.forOwn(service, (value, key) => {
                if(key === 'name' || key === 'warnings'){
                    return;
                }
                if(_.isArray(value)) {
                    const res = [];
                    _.forEach(value, (obj) => {
                        if(obj instanceof BaseComponent){
                            res.push(obj.toString());
                        } else {
                            res.push(obj);
                        }
                    });
                    json[name][key] = res;
                } else {
                    if(value instanceof BaseComponent){
                        json[name][key] = value.toString();
                    } else {
                        json[name][key] = value;
                    }
                }

            });

        });

        return json;
    }
}

module.exports = ComposeV1;