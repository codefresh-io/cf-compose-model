'use strict';
const _         = require('lodash');
const Base      = require('./BaseComponent');
const Validator = new require('jsonschema').Validator;
const v         = new Validator();


const errorMessages = {
    emptyName: 'Cant initiate service that have no name or name is empty string',
    emptyData: 'Cant init Service without data'
};

const schema = {
    dockerfile: 'number'
};

/**
 * name: name of the service
 * data:
 *  build: String or Object
 *  dockerfile: String - path to dockerfile - default is Dockerfile
 *  command: String or array
 *  containerName: String. // Because Docker container names must be unique, you cannot scale a service beyond 1 container if you have specified a custom name. Attempting to do so results in an error.
 *  entryPoint: String or array
 *
 */
class Service extends Base {
    constructor(data) {
        super();
        if (!data) {
            throw new Error(errorMessages.emptyData);
        }

        this.dockerfile = 'Dockerfile';

        if(data.container_name){
            // TODO : remove or something else
        }
        _.merge(this, data);
    }

    addLabel(label){
        if(!this.labels){
            this.labels = [];
        }
        this.labels.push(label);
    }

    addEnvironmentVariable(key, value){
        if(!this.environments){
            this.environments = {};
        }
        
        if(_.isArray(this.environments)){
            this.environments.push(`${key}=${value}`);
        }
        this.environments[key] = value;
    }

}

module.exports = Service;