'use strict';

const BaseStep     = require('./BaseStep');
const cm           = require('./../../');
const Promise      = require('bluebird'); // jshint ignore:line
const _            = require('lodash');
const ComposeModel = cm.ComposeModel;
require('console.table'); // jshint ignore:line

class GetWarnings extends BaseStep {
    constructor(name, obj) {
        super('get-warnings', name, obj);
    }

    /**
     * Overwrite the base _writeOutputToConsole
     * @param warnings
     * @private
     */
    _writeOutputToConsole(warnings) {
        console.log(`Warning:`.bold);
        console.table(warnings);
    }

    exec(composeModel) {
        const warningsObject = this._stepData;
        if (!(composeModel instanceof ComposeModel)) {
            return Promise.reject(new Error('Not invoked with ComposeModel instance'));
        }
        return composeModel.getWarnings()
            .then(this.formatAllWarnings.bind(this))
            .then(result => {
                const res = _.get(warningsObject, 'result');
                if (res === 'empty') {
                    this._invokeAssertion(result, []);
                }
                else if (res) {
                    this._invokeAssertion(result, warningsObject.result);
                }
                this._writeOutput(result, 'Found warnings:');
                return composeModel;
            });

    }
}

module.exports = GetWarnings;