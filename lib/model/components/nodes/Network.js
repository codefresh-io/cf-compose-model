'use strict';
const _       = require('lodash');

const Node    = require('./../base').CFNode;

class Network extends Node {

    constructor(name, data){
        super(name);
        _.merge(this, data);
    }

}

module.exports = Network;