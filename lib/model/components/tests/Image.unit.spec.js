const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Image     = require('./../Image');
const policies  = require('./../../policies');

const expect = chai.expect;
chai.use(sinonChai);


describe('Image testing', () => {

    describe('Parser', () => {

        it('Should parse only image name', () => {
            const image = Image.parse('redis');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal(undefined);
            expect(image.getOwner()).to.be.equal(undefined);
        });

        it('Should parse image with owner', () => {
            const image = Image.parse('tutum/redis');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal(undefined);
            expect(image.getOwner()).to.be.equal('tutum');
        });

        it('Should parse image with tag', () => {
            const image = Image.parse('redis:0.1');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal('0.1');
            expect(image.getOwner()).to.be.equal(undefined);
        });

        it('Should parse image with owner and tag', () => {
            const image = Image.parse('tutum/redis:0.1');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal('0.1');
            expect(image.getOwner()).to.be.equal('tutum');
        });

        it('Should parse image with registry and repo name', () => {
            const imageString = 'example-registry.com:4000/postgresql';
            const image       = Image.parse(imageString);

            expect(image.getOwner()).to.be.equal('example-registry.com:4000');
            expect(image.getRepo()).to.be.equal('postgresql');
        });

        it('Should parse image with special chars', () => {
            const imageString = 'express-app-container:latest';
            const image       = Image.parse(imageString);
            expect(image.getRepo()).to.be.equal('express-app-container');
            expect(image.getTag()).to.be.equal('latest');
        });

    });

    describe('Warnings and fixes', () => {
        it('Should get warnings related to the owner and the tag', () => {
            const image = Image.parse('redis');
            expect(image.getWarnings(policies.shared.services['image'])).to.be.deep.equal([
                {
                    "actual": "redis",
                    "autoFix": true,
                    "message": undefined,
                    "name": "LACK_OF_DETAILS_TAG",
                    "requireManuallyFix": false,
                    "suggestion": "latest"
                }, {
                    "actual": "redis",
                    "autoFix": false,
                    "message": undefined,
                    "name": "LACK_OF_DETAILS_OWNER_NAME",
                    "requireManuallyFix": true,
                    "suggestion": ""
                }
            ]);
        });

        it('Should fix warnings related to the tag', () => {
            const image = Image.parse('redis');
            expect(image.getWarnings(policies.shared.services['image'])).to.be.deep.equal([
                    {
                        "actual": "redis",
                        "autoFix": true,
                        "message": undefined,
                        "name": "LACK_OF_DETAILS_TAG",
                        "requireManuallyFix": false,
                        "suggestion": "latest",
                    }, {
                        "actual": "redis",
                        "autoFix": false,
                        "message": undefined,
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    }
                ]
            );
            image.fixWarnings();
            expect(image.getWarnings(policies.shared.services['image'])).to.be.deep.equal([{
                "actual": "redis:latest",
                "autoFix": false,
                "message": undefined,
                "name": "LACK_OF_DETAILS_OWNER_NAME",
                "requireManuallyFix": true,
                "suggestion": ""
            }
            ]);
        });
    });

    describe('Warning', () => {
        it('Should get all warnings for image with only image name', () => {
            const image = Image.parse('redis');
            expect(image.getWarnings(policies.shared.services['image'])).to.be.deep.equal([{
                "actual": "redis",
                "autoFix": true,
                "message": undefined,
                "name": "LACK_OF_DETAILS_TAG",
                "requireManuallyFix": false,
                "suggestion": "latest",
            }, {
                "actual": "redis",
                "autoFix": false,
                "message": undefined,
                "name": "LACK_OF_DETAILS_OWNER_NAME",
                "requireManuallyFix": true,
                "suggestion": "",
            }
            ]);
        });

        it('Should get all warnings for image with image name and tag', () => {
            const image = Image.parse('redis:0.1');
            expect(image.getWarnings(policies.shared.services['image'])).to.be.deep.equal([{
                "actual": "redis:0.1",
                "autoFix": false,
                "message": undefined,
                "name": "LACK_OF_DETAILS_OWNER_NAME",
                "requireManuallyFix": true,
                "suggestion": "",
            }
            ]);
        });

        it('Should get all warnings for image with image name and owner', () => {
            const image = Image.parse('tutum/redis');
            expect(image.getWarnings(policies.shared.services['image'])).to.be.deep.equal([{
                "actual": "tutum:redis",
                "autoFix": true,
                "message": undefined,
                "name": "LACK_OF_DETAILS_TAG",
                "requireManuallyFix": false,
                "suggestion": "latest"
            }
            ]);
        });


        it('Should get zero warnings when all params exist', () => {
            const image = Image.parse('tutum/redis:0.1');
            expect(image.getWarnings(policies.shared.services['image'])).to.be.deep.equal([]);
        });


    });

    describe('Build manually', () => {
        it('Using data object', () => {
            const image = new Image({
                owner: 'owner',
                repo: 'repository',
                tag: 'v1'
            });

            expect(image.getOwner()).to.be.equal('owner');
            expect(image.getRepo()).to.be.equal('repository');
            expect(image.getTag()).to.be.equal('v1');
        });

        it('Using setters', () => {
            const image = new Image()
                .setRepo('repo')
                .setOwner('owner')
                .setTag('v1');

            expect(image.getOwner()).to.be.equal('owner');
            expect(image.getRepo()).to.be.equal('repo');
            expect(image.getTag()).to.be.equal('v1');
        });
    });

});

