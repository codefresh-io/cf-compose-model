'use strict';

const chai            = require('chai');
const sinonChai       = require('sinon-chai');
const PromiseProvider = require('./../PromiseProvider');
const provider        = new PromiseProvider();
const BBPromise       = require('bluebird'); // jshint ignore:line
const QPromise        = require('q');

const expect = chai.expect; // jshint ignore:line
chai.use(sinonChai);

describe('Promise provider library', () => {
    it('Should set the default promise as Bluebird promise', () => {
        expect(provider.get()).to.be.equal(BBPromise);
        expect(provider.resolve(BBPromise.map([], () => {})))
            .to
            .be
            .an
            .instanceof(BBPromise.Promise);
        expect(provider.resolve(BBPromise.resolve())).to.be.an.instanceof(BBPromise.Promise);
    });

    //It defined the promise globaly
    it('Should set the default provider to be a native promise', () => {
        provider.setProvider(Promise);
        expect(provider.get()).to.be.equal(Promise);
        provider.resetProvider();
    });

    //It defined the promise globaly
    it.skip('Should set the provider with Q', () => {
        provider.setProvider(QPromise.Promise);
        expect(provider.get()).to.be.equal(QPromise.Promise);

        const p = BBPromise.reject('Q lib');
        return provider.resolve(p)
            .fail(reason => {
                expect(reason).to.be.equal('Q lib');
            })
            .then(provider.resetProvider);
    });

});