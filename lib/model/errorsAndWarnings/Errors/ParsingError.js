'use strict';

// const ValidationError = require('./Error');
const _       = require('lodash');
const YAML    = require('js-yaml');
const Promise = require('bluebird'); // jshint ignore:line

class ParsingError extends Error {
    constructor(message) {
        super();
        this._name    = 'PARSING_FAILED';
        this._message = message;
    }

    /**
     * Create a string with all the information about the error
     * @return {*}
     */
    toString() {
        let finalString = ``;

        finalString += `Error: ${this._name}\n`;
        finalString += `With message: ${this._message}\n`;

        if (_.isArray(this.errors)) {
            finalString += `Found errors:\n`;
            _.forEach(this.errors, (error) => {
                finalString += `${JSON.stringify(error.format())}\n`;
            });
        }

        if (_.isArray(this.warnings)) {
            finalString += `Found warnings:\n`;
            _.forEach(this.warnings, (warning) => {
                finalString += `${JSON.stringify(warning.format())}\n`;
            });
        }

        if (this.originalYaml) {
            finalString += `Based on input\n\n`;
            finalString += `${YAML.dump(this.originalYaml)}`;
        }
        return finalString;
    }

    asyncToString(){
        return Promise.resolve()
            .then(() => {
                return this.toString(); // TODO : actually make it async :)
            });
    }
}

module.exports = ParsingError;