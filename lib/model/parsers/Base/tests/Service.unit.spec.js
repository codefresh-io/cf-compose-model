'use strict';

const chai                   = require('chai');
const sinonChai              = require('sinon-chai');
const ComposeV1ServiceParser = require('./../Service');
const Service                = require('./../../../components/service/Service');
const expect                 = chai.expect;
chai.use(sinonChai);

describe('Base service parser', () => {
    describe('Default values', function () {
        it('should set default values to fields that are absent', function () {
            const testName = 'user';
            const defaultValue = 'value';
            const yamlString = {};
            const composeV1ServiceParser = new ComposeV1ServiceParser('web', yamlString);
            composeV1ServiceParser.defaultFieldValues = {[testName]: defaultValue};
            return composeV1ServiceParser.parse()
                .then(service => {
                    expect(service).to.be.deep.equal(new Service('web').setAdditionalData(testName, defaultValue));
                });
        });
        it('should not set default values to fields that are present', function () {
            const testName = 'user';
            const defaultValue = 'value';
            const actualValue = 'actual';
            const yamlString = {[testName]: actualValue};
            const composeV1ServiceParser = new ComposeV1ServiceParser('web', yamlString);
            composeV1ServiceParser.defaultFieldValues = {[testName]: defaultValue};
            return composeV1ServiceParser.parse()
                .then(service => {
                    expect(service).to.be.deep.equal(new Service('web').setAdditionalData(testName, actualValue));
                });
        });
    });

});
