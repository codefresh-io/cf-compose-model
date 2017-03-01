const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Service   = require('./../Service');

const expect = chai.expect;
chai.use(sinonChai);


describe('Service testing', () => {
    describe('Positive:', () => {
        it('Should replace the default dockerfile when passed', () => {
            const service = new Service('service', {
                dockerfile: 'my-docker-file'
            });
            expect(service.dockerfile).to.be.equal('my-docker-file');
        });

    });

    describe('Negative:', () => {
        it(`Shouln't init service just with name`, () => {
            try {
                new Service('Name');
                throw new Error('');
            } catch(err){
                expect(err.toString()).to.have.string('Cant init Service without data');
            }
        });

        it(`Shouldn't init service that have empty string in the name`, () => {
            try {
                new Service('');
                throw new Error('');
            } catch(err){
                expect(err.toString()).to.have.string('Cant initiate service that have no name or name is empty string');
            }
        });
    });
});