'use strict';

const CmError = require('./CmError');

/**
 * Should be changed later
 * @param message
 * @param original
 * @constructor
 */
const CostumViolation = function (original) {
    this.message  = 'Yaml version not supported yet'; // TODO : change laater
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
 * Error that will be thrown in that parser not found for the input
 */
const MESSAGE = 'PARSER_NOT_FOUND';
class ParserNotFoundError extends CmError {
    constructor(originalInput) {
        super(MESSAGE);
        this._basedOnInput = originalInput;
        this.addError(new CostumViolation(originalInput));
    }

    toString(){
        let finalString = ``;

        finalString += `Error: ${this.message}\n`;
        finalString += `With message: Cannot find suitable parser for requested input\n`;

        finalString += `Based on input:\n\n${JSON.stringify(this._basedOnInput)}`;

        return finalString;
    }
}

module.exports = ParserNotFoundError;