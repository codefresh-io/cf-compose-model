'use strict';

const chai                      = require('chai');
const sinonChai                 = require('sinon-chai');
const ParsingComposeError       = require('./../ParsingComposeError');
const expect                    = chai.expect;
chai.use(sinonChai);

describe('ParsingComposeError testing', () => {
    it('Should be Error', () => {
        expect(new ParsingComposeError()).to.be.an.instanceof(Error);
    });

    it('Should have message', () => {
        expect(new ParsingComposeError().message).to.be.equal('PARSING_COMPOSE_FAILED');
    });

    it('Should have the original input', () => {
        const input = { 'some-key': 'some value' };
        expect(new ParsingComposeError(input)._basedOnInput)
            .to
            .be
            .equal(input);
    });

    it('Should return string', () => {
        const input = { 'some-key': 'some value' };
        expect(new ParsingComposeError(input).toString())
            .to
            .be
            .equal(
                'Error: PARSING_COMPOSE_FAILED\nWith message: Failed to parse compose object\nBased on input:\n\n{"some-key":"some value"}');
    });

    it('Should change set the inpit', () => {
        const err = new ParsingComposeError('should be replaced');
        err.setInput('new input');
        expect(err.getInput()).to.be.deep.equal('new input');
    });

});

