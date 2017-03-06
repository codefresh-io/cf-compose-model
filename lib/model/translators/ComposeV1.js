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
                if(key === 'name'){
                    return;
                }
                if(_.isArray(value)) {
                    const res = [];
                    _.forEach(value, (obj) => {
                        if(obj instanceof BaseComponent){
                            if(_.get(value, 'warning.autoFix', false)){
                                const newValue = ComposeV1.actOnWarning(value);
                                if(newValue){
                                    res.push(newValue);
                                }
                            } else {
                                res.push(obj.toString());
                            }
                        } else {
                            res.push(obj);
                        }
                    });
                    json[name][key] = res;
                } else {
                    if(value instanceof BaseComponent){
                        if(_.get(value, 'warning.autoFix', false)){
                            const newValue = ComposeV1.actOnWarning(value);
                            if(newValue){
                                json[name][value.key] = newValue;
                            }
                        } else {
                            json[name][value.key] = value.toString();
                        }
                    } else {
                        json[name][key] = value;
                    }
                }

            });

        });

        return json;
    }

    static actOnWarning(instance){ // jshint ignore:line
        //const cases = {
        //    'NOT_SUPPORTED': () => {} //do nothing
        //}; // jshint ignore:line
    }
}

module.exports = ComposeV1;