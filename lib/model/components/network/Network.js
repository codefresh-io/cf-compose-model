'use strict';

const Base = require('../Base');
const _    = require('lodash');

const internalFields = ['_metadata',
    '_name',
    'warnings',
    '_order'
];

class Network extends Base {

    constructor(name) {
        super(name);
    }

    /**
     * Returns the order of the properties
     * @return {*}
     */
    getOrder() {
        return _.keys(_.omit(this, internalFields));
    }

    getDriver(){
        return this.driver;
    }

}

module.exports = Network;