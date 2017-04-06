'use strict';

const chai      = require('chai');
const sinonChai = require('sinon-chai');
const CmError   = require('./../CmError');
const expect    = chai.expect;
chai.use(sinonChai);

describe('CmError testing', () => {


    const FakeWarning = function(){
        this.format = function(){
            return {

            };
        };
    };

    const FakeError = function(){
        this.format = function(){
            return {

            };
        };
    };



    it('Should be Error', () => {
        expect(new CmError()).to.be.an.instanceof(Error);
    });

    it('Should throw error from toString', () => {
        try{
            new CmError().toString();
        } catch (err){
            expect(err.message).to.be.deep.equal('Not implemented');
        }
    });

    it('getErrors and getWarnings should return empty array after init', () => {
        const cme = new CmError();
        expect(cme.getErrors()).to.be.deep.equal([]);
        expect(cme.getWarnings()).to.be.deep.equal([]);
    });

    it('Should add errors', () => {
        const cme = new CmError();
        cme.addError({});
        expect(cme._errors).to.be.deep.equal([{}]);
    });

    it('addWarning', () => {
        const cme = new CmError();
        cme.addWarning(new FakeWarning());
        cme.addWarning(new FakeWarning());
        cme.addWarning(new FakeWarning());
        expect(cme._warnings.length).to.be.equal(3);
    });

    it('addWarningsSet', () => {
        const cme = new CmError();
        cme.addWarning(new FakeWarning());
        cme.addWarning(new FakeWarning());
        cme.addWarning(new FakeWarning());
        cme.addWarningsSet([new FakeWarning(), new FakeWarning(), new FakeWarning()]);
        expect(cme._warnings.length).to.be.equal(6);
    });

    it('addErrorsSet', () => {
        const cme = new CmError();
        cme.addError(new FakeError());
        cme.addError(new FakeError());
        cme.addError(new FakeError());
        cme.addErrorsSet([new FakeError(), new FakeError(), new FakeError()]);
        expect(cme._errors.length).to.be.equal(6);
    });

    it('Should have some flag to be used outside of the component', () => {
        expect(new CmError().isCmError).to.be.equal(true);
    });

});

