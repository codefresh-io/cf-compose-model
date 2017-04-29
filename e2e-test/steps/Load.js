'use strict';

const BaseStep     = require('./BaseStep');
const cm           = require('./../../');
const path         = require('path');
const ComposeModel = cm.ComposeModel;
const policies     = cm.policies;

class Load extends BaseStep {
    constructor(name, obj) {
        super('load', name, obj);
    }

    exec(folderPath) {
        const stepObject = this._stepData;
        const location = path.resolve(folderPath, stepObject.file);
        return ComposeModel.load(location,
            stepObject.policy ? policies[stepObject.policy] : policies.shared)
            .then(composeModel => {
                if (stepObject['on-fail']) {
                    throw new Error('on-fail was defined but the load step was successful, check you file and the flow flow configuration');
                }
                return composeModel;
            })
            .catch(err => {
                if (stepObject['on-fail'] && err.isCmError) {
                    const onFail = stepObject['on-fail'];
                    if (onFail.message) {
                        this._invokeAssertion(err.toString(), onFail.message);
                    }
                    if (onFail['errors-content']) {
                        const errors = err.getErrors().map(err => err.format());
                        this._invokeAssertion(errors, onFail['errors-content']);
                    }
                } else {
                    throw err;
                }
            });
    }
}

module.exports = Load;