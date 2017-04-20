'use strict';

const chai                = require('chai');
const sinonChai           = require('sinon-chai');
const ParserNotFoundError = require('./../ParserNotFoundError');
const expect              = chai.expect;
chai.use(sinonChai);

describe('ParserNotFoundError testing', () => {
    it('Should be Error', () => {
        expect(new ParserNotFoundError()).to.be.an.instanceof(Error);
    });

    it('Should have message', () => {
        expect(new ParserNotFoundError().message).to.be.equal('PARSER_NOT_FOUND');
    });

    it('Should have the original input', () => {
        const input = {'some-key': 'some value'};
        expect(new ParserNotFoundError(input)._basedOnInput).to.be.equal(input);
    });

    it('Should return string', () => {
        const input = {'some-key': 'some value'};
        expect(new ParserNotFoundError(input).toString())
            .to
            .be
            .equal('Error: PARSER_NOT_FOUND\nWith message: Cannot find suitable parser for requested input\nBased on input:\n\n{"some-key":"some value"}');
    });

    it('getErrors should have one error about the parsing', () => {
        const input = {'some-key': 'some value'};
        expect(new ParserNotFoundError(input).getErrors()[0].format()).to.be.deep.equal({
            "message": "Yaml version not supported yet",
            "name": "YAML_PARSING_FAILED",
            "original": {
                "some-key": "some value"
            }
        });
    });
});

