'use strict';

const chai            = require('chai');
const sinonChai       = require('sinon-chai');
const YamlSyntaxError = require('./../YamlSyntaxError');
const expect          = chai.expect;
chai.use(sinonChai);

describe('YamlSyntaxError testing', () => {
    it('Should be Error', () => {
        expect(new YamlSyntaxError()).to.be.an.instanceof(Error);
    });

    it('Should have message', () => {
        expect(new YamlSyntaxError().message).to.be.equal('YAML_PARSING_FAILED');
    });

    it('Should have the original input', () => {
        const input = {'some-key': 'some value'};
        expect(new YamlSyntaxError(input, 'parsing failed at column')._basedOnInput).to.be.equal(input);
    });

    it('Should return string', () => {
        const input = {'some-key': 'some value'};
        expect(new YamlSyntaxError(input, 'parsing failed at column').toString())
            .to
            .be
            .equal('Error: YAML_PARSING_FAILED\nWith message: parsing failed at column\nBased on input:\n\nsome-key: some value\n');
    });

    it('getErrors should have one error about the parsing', () => {
        const input = {'some-key': 'some value'};
        expect(new YamlSyntaxError(input, 'parsing failed at column').getErrors()[0].format()).to.be.deep.equal({
            "message": "parsing failed at column",
            "name": "YAML_PARSING_FAILED",
            "original": {
                "some-key": "some value"
            }
        });
    });
});

