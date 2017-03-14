'use strict';
const _    = require('lodash');
const Base = require('../Base');

class Network extends Base {

    constructor(name, data) {
        super(name);
        _.merge(this, data);
    }

}

module.exports = Network;