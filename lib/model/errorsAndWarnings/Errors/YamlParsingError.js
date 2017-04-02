'use strict';

const YAML = require('js-yaml');

class YamlParsingError extends Error {
    constructor(message, original) {
        super();
        this.name     = 'PARSING_FAILED';
        this.message  = message;
        this.original = original;
    }

    toString() {
        let finalString = ``;

        finalString += `Error: ${this.name}\n`;
        finalString += `With message: ${this.message}\n`;


        if (this.original) {
            finalString += `Based on input\n\n`;
            finalString += `${YAML.dump(this.original)}`;
        }
        return finalString;
    }
}

module.exports = YamlParsingError;