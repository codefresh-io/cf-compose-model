'use strict';
const _    = require('lodash');
const Base = require('../Base');

class Volume extends Base {

    constructor(name, data) {
        super(name);
        _.merge(this, data);
    }

}

module.exports = Volume;