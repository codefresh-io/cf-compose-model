'use strict';

const _             = require('lodash');
const CFLeaf        = require('./../components/base').CFLeaf;

class ComposeV1 {

    static translate(compose) {
        let json = {};

        const service = compose.services;

        _.forOwn(service, (service, name) => {

            json[name] = {};

            _.forOwn(service.toJson(), (value, key) => {

                if (_.isArray(value)) {
                    const res = [];
                    _.forEach(value, (obj) => {
                        if (obj instanceof CFLeaf) {
                            res.push(obj.toString());
                        } else {
                            res.push(obj);
                        }
                    });
                    json[name][key] = res;
                } else {
                    if (value instanceof CFLeaf) {
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