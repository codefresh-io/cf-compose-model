'use strict';

const BaseStep     = require('./BaseStep');
const cm           = require('./../../');
const Promise      = require('bluebird'); // jshint ignore:line
const _            = require('lodash');
const ComposeModel = cm.ComposeModel;

const chai   = require('chai');
const expect = chai.expect;


function formatAllWarnings(unformatted) {
    return Promise.map(unformatted, (warning) => { return warning.format(); });
}

class FixWarnings extends BaseStep {
    constructor() {
        super('fix-warnings');
    }

    exec(fixWarningObj) {
        return function (composeModel) {

            if (!(composeModel instanceof ComposeModel)) {
                return Promise.reject(new Error('Not invoked with ComposeModel instance'));
            }

            return composeModel.fixWarnings()
                .then(formatAllWarnings)
                .then(remaningWarnings => {
                    const res = _.get(fixWarningObj, 'result');
                    if (res === 'empty') {
                        expect(remaningWarnings).to.be.deep.equal([]);
                    }
                    else if (res) {
                        expect(remaningWarnings).to.be.deep.equal(res);
                    }
                })
                .then(() => composeModel);

        };
    }
}

module.exports = FixWarnings;