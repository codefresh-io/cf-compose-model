'use strict';

const CmError =require('./CmError');

/**
 * Error that will be thrown in case that the yaml not been supplied to ComposeModel.parse
 */
const MESSAGE = 'YAML_NOT_SUPPLIED';
class YamlNotSuppliedError extends CmError {
    constructor(){
        super(MESSAGE);
    }

    toString(){
        let finalString = ``;

        finalString += `Error: ${this.message}`;

        return finalString;
    }
}

module.exports = YamlNotSuppliedError;