const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Image     = require('../service/Image');

const expect = chai.expect;
chai.use(sinonChai);


describe('Image testing', () => {

    describe('Parser', () => {

        it('Should parse only image name', () => {
            const image = new Image('redis');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal(undefined);
            expect(image.getOwner()).to.be.equal(undefined);
        });

        it('Should parse image with owner', () => {
            const image = new Image('tutum/redis');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal(undefined);
            expect(image.getOwner()).to.be.equal('tutum');
        });

        it('Should parse image with tag', () => {
            const image = new Image('redis:0.1');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal('0.1');
            expect(image.getOwner()).to.be.equal(undefined);
        });

        it('Should parse image with owner and tag', () => {
            const image = new Image('tutum/redis:0.1');
            expect(image.getRepo()).to.be.equal('redis');
            expect(image.getTag()).to.be.equal('0.1');
            expect(image.getOwner()).to.be.equal('tutum');
        });

        it('Should parse image with registry and repo name', () => {
            const imageString = 'example-registry.com:4000/postgresql';
            const image       = new Image(imageString);

            expect(image.getOwner()).to.be.equal('example-registry.com:4000');
            expect(image.getRepo()).to.be.equal('postgresql');
        });

        it('Should parse image with special chars', () => {
            const imageString = 'express-app-container:latest';
            const image       = new Image(imageString);
            expect(image.getRepo()).to.be.equal('express-app-container');
            expect(image.getTag()).to.be.equal('latest');
        });

    });

    describe('Warnings and fixes', () => {
        it('Should get warnings related to the owner and the tag', () => {
            const image = new Image('redis');
            expect(image.getWarnings()).to.be.deep.equal([
                {
                    "actual": "redis",
                    "autoFix": true,
                    "message": undefined,
                    "name": "MISSING_IMAGE_DETAILS_TAG",
                    "requireManuallyFix": false,
                    "suggestion": "latest"
                }, {
                    "actual": "redis",
                    "autoFix": false,
                    "message": undefined,
                    "name": "MISSING_IMAGE_DETAILS_OWNER_NAME",
                    "requireManuallyFix": false,
                    "suggestion": ""
                }
            ]);
        });

        it('Should fix warnings related to the tag', () => {
            const image = new Image('redis');
            expect(image.getWarnings()).to.be.deep.equal([
                    {
                        "actual": "redis",
                        "autoFix": true,
                        "message": undefined,
                        "name": "MISSING_IMAGE_DETAILS_TAG",
                        "requireManuallyFix": false,
                        "suggestion": "latest",
                    }, {
                        "actual": "redis",
                        "autoFix": false,
                        "message": undefined,
                        "name": "MISSING_IMAGE_DETAILS_OWNER_NAME",
                        "requireManuallyFix": false,
                        "suggestion": ""
                    }
                ]
            );
            image.fixWarnings();
            expect(image.getWarnings()).to.be.deep.equal([{
                "actual": "redis:latest",
                "autoFix": false,
                "message": undefined,
                "name": "MISSING_IMAGE_DETAILS_OWNER_NAME",
                "requireManuallyFix": false,
                "suggestion": ""
            }
            ]);
        });
    });

    describe('Warning', () => {
        it('Should get all warnings for image with only image name', () => {
            const image = new Image('redis');
            expect(image.getWarnings()).to.be.deep.equal([{
                "actual": "redis",
                "autoFix": true,
                "message": undefined,
                "name": "MISSING_IMAGE_DETAILS_TAG",
                "requireManuallyFix": false,
                "suggestion": "latest",
            }, {
                "actual": "redis",
                "autoFix": false,
                "message": undefined,
                "name": "MISSING_IMAGE_DETAILS_OWNER_NAME",
                "requireManuallyFix": false,
                "suggestion": "",
            }
            ]);
        });

        it('Should get all warnings for image with image name and tag', () => {
            const image = new Image('redis:0.1');
            expect(image.getWarnings()).to.be.deep.equal([{
                "actual": "redis:0.1",
                "autoFix": false,
                "message": undefined,
                "name": "MISSING_IMAGE_DETAILS_OWNER_NAME",
                "requireManuallyFix": false,
                "suggestion": "",
            }
            ]);
        });

        it('Should get all warnings for image with image name and owner', () => {
            const image = new Image('tutum/redis');
            expect(image.getWarnings()).to.be.deep.equal([{
                "actual": "tutum:redis",
                "autoFix": true,
                "message": undefined,
                "name": "MISSING_IMAGE_DETAILS_TAG",
                "requireManuallyFix": false,
                "suggestion": "latest"
            }
            ]);
        });


        it('Should get zero warnings when all params exist', () => {
            const image = new Image('tutum/redis:0.1');
            expect(image.getWarnings()).to.be.deep.equal([]);
        });


    });

    describe('Build manually', () => {
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
