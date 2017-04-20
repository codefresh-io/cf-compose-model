'use strict';

const CmError =require('./CmError');

/**
 * Error that will be thrown in case that the compose object failed to parsed
 */
const MESSAGE = 'PARSING_COMPOSE_FAILED';
class ParsingComposeError extends CmError {
    constructor(originalInput){
        super(MESSAGE);
        this._basedOnInput = originalInput;
    }

    toString(){
        let finalString = ``;

        finalString += `Error: ${this.message}\n`;
        finalString += `With message: Failed to parse compose object\n`;

        finalString += `Based on input:\n\n${JSON.stringify(this._basedOnInput)}`;

        return finalString;
    }

    setInput(input){
        this._basedOnInput = input;
    }

    getInput(){
        return this._basedOnInput;
    }
}

module.exports = ParsingComposeError;