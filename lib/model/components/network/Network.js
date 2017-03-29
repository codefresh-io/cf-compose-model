'use strict';

const Base = require('../Base');

class Network extends Base {

    constructor(name) {
        super(name);
        this.driver = 'bridge'; //default driver since yaml cant dump undefined
    }

}

module.exports = Network;