'use strict';
const CmBaseViolation = require('./CmBaseViolation');

class CmError extends CmBaseViolation {
    constructor() {
        super();
    }
}

module.exports = CmError;