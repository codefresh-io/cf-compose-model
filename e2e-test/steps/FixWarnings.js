'use strict';

const BaseStep     = require('./BaseStep');
const cm           = require('./../../');
const Promise      = require('bluebird'); // jshint ignore:line
const _            = require('lodash');
const ComposeModel = cm.ComposeModel;

class FixWarnings extends BaseStep {
    constructor(name, obj) {
        super('fix-warnings', name, obj);
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
        const fixWarningObj = this._stepData;
        if (!(composeModel instanceof ComposeModel)) {
            return Promise.reject(new Error('Not invoked with ComposeModel instance'));
        }

        return composeModel.fixWarnings()
            .then(this.formatAllWarnings.bind(this))
            .then(remaningWarnings => {
                if (_.size(remaningWarnings) > 0) {
                    this._writeOutput(remaningWarnings, 'The remaining warnings are:');
                }
                const res = _.get(fixWarningObj, 'result');
                if (res === 'empty') {
                    this._invokeAssertion(remaningWarnings, []);
                }
                else if (res) {
                    this._invokeAssertion(remaningWarnings, res);
                }
            })
            .then(() => composeModel);

    }
}

module.exports = FixWarnings;