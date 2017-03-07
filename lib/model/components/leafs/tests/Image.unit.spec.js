const chai      = require('chai');
const sinonChai = require('sinon-chai');
const Image     = require('./../Image');
const policies  = require('./../../../policies');

const expect = chai.expect;
chai.use(sinonChai);


describe('Image testing', () => {

    describe('Parser', () => {

        it('Should parse only image name', () => {
            const image = Image.parse('redis');
            expect(image.imageName).to.be.equal('redis');
            expect(image.tag).to.be.equal(undefined);
            expect(image.owner).to.be.equal(undefined);
        });

        it('Should parse image with owner', () => {
            const image = Image.parse('tutum/redis');
            expect(image.imageName).to.be.equal('redis');
            expect(image.tag).to.be.equal(undefined);
            expect(image.owner).to.be.equal('tutum');
        });

        it('Should parse image with tag', () => {
            const image = Image.parse('redis:0.1');
            expect(image.imageName).to.be.equal('redis');
            expect(image.tag).to.be.equal('0.1');
            expect(image.owner).to.be.equal(undefined);
        });

        it('Should parse image with owner and tag', () => {
            const image = Image.parse('tutum/redis:0.1');
            expect(image.imageName).to.be.equal('redis');
            expect(image.tag).to.be.equal('0.1');
            expect(image.owner).to.be.equal('tutum');
        });



    });

    describe('Warnings and fixes', () => {
        it('Should get warnings related to the owner and the tag', () => {
            const image = Image.parse('redis');
            expect(image.getWarnings(policies.shared.services)).to.be.deep.equal([
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
            expect(image.getWarnings(policies.shared.services)).to.be.deep.equal([
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
            expect(image.getWarnings(policies.shared.services)).to.be.deep.equal([{
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
            expect(image.getWarnings(policies.shared.services)).to.be.deep.equal([{
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
            expect(image.getWarnings(policies.shared.services)).to.be.deep.equal([{
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
            expect(image.getWarnings(policies.shared.services)).to.be.deep.equal([{
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
            expect(image.getWarnings(policies.shared.services)).to.be.deep.equal([]);
        });


    });

});

