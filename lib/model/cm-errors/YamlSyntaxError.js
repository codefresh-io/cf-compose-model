'use strict';

const YAML    = require('js-yaml');
const CmError = require('./CmError');

/**
 * Should be changed later
 * @param message
 * @param original
 * @constructor
 */
const CostumViolation = function (message, original) {
    this.message  = message;
    this.original = original;
    this.format   = function () {
        return {
            name: 'YAML_PARSING_FAILED',
            message: this.message,
            original: this.original
        };
    };
};

/**
 * Error that will be thrown in case that the yaml parsing failed using 3th module
 */
const MESSAGE = 'YAML_PARSING_FAILED';
class YamlNotSuppliedError extends CmError {
    constructor(originalYaml, errorMessage) {
        super(MESSAGE);
        this._basedOnInput = originalYaml;
        this._errorMessage = errorMessage;
        this.addError(new CostumViolation(errorMessage, originalYaml));
    }

    toString() {
        let finalString = ``;

        finalString += `Error: ${this.message}\n`;
        finalString += `With message: ${this._errorMessage}\n`;

        finalString += `Based on input:\n\n${YAML.dump(this._basedOnInput)}`;

        return finalString;
    }
}

module.exports = YamlNotSuppliedError;