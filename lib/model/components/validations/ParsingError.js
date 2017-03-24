'use strict'

const ValidationError = require('./Error');

class ParsingError extends ValidationError {
    constructor(message, original) {
        super('PARSING_FAILED', message, original);
    }
}

module.exports = ParsingError;