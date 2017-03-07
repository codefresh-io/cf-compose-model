'use strict';

const chai           = require('chai');
const sinonChai      = require('sinon-chai');
const CFComposeModel = require('./../CFComposeModel');
const parsers        = require('./../parsers');

const expect = chai.expect; // jshint ignore:line
chai.use(sinonChai);



describe('CFComposeModel', () => {

    describe('Load', () => {

        describe('Compose v1', () => {

            it('Detect compose v1', () => {
                const filePath = `${__dirname}/ComposeV1/ex1.yaml`;
                const compose  = CFComposeModel.load(filePath);
                expect(compose.parser).to.be.equal(parsers.ComposeV1);
            });

            it('Should find all warnings', () => {
                const filePath = `${__dirname}/ComposeV1/ex1.yaml`;
                const compose  = CFComposeModel.load(filePath);
                expect(compose.getWarnings()).to.be.deep.equal([{
                    "actual": "5432:5432 ",
                    "autoFix": false,
                    "message": "Warning: at service dbpostgres.ports",
                    "name": "NO_PERMISSION",
                    "requireManuallyFix": false,
                    "suggestion": "5432"
                }, {
                    "actual": "db",
                    "autoFix": true,
                    "message": "Warning: at service dbpostgres.container_name",
                    "name": "NOT_SUPPORTED",
                    "requireManuallyFix": false,
                    "suggestion": "Remove field"
                }, {
                    "actual": "3000:3000 ",
                    "autoFix": false,
                    "message": "Warning: at service express-app-container.ports",
                    "name": "NO_PERMISSION",
                    "requireManuallyFix": false,
                    "suggestion": "3000"
                }, {
                    "actual": "./:/app",
                    "autoFix": false,
                    "message": "Warning: at service express-app-container.volumes",
                    "name": "NO_PERMISSION",
                    "requireManuallyFix": true,
                    "suggestion": "/app"
                }, {
                    "actual": ".",
                    "autoFix": true,
                    "message": "Warning: at service express-app-container.build",
                    "name": "NOT_SUPPORTED",
                    "requireManuallyFix": false,
                    "suggestion": "Replace with image"
                }
                ]);
            });

            it('Should fix all possible warnings and translate', () => {
                const filePath = `${__dirname}/ComposeV1/ex1.yaml`;
                const compose  = CFComposeModel.load(filePath);

                expect(compose.getWarnings()).to.be.deep.equal([
                    {
                        "actual": "5432:5432 ",
                        "autoFix": false,
                        "message": "Warning: at service dbpostgres.ports",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": false,
                        "suggestion": "5432",
                    },
                    {
                        "actual": "db",
                        "autoFix": true,
                        "message": "Warning: at service dbpostgres.container_name",
                        "name": "NOT_SUPPORTED",
                        "requireManuallyFix": false,
                        "suggestion": "Remove field"
                    },
                    {
                        "actual": "3000:3000 ",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.ports",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": false,
                        "suggestion": "3000"
                    },
                    {
                        "actual": "./:/app",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.volumes",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": true,
                        "suggestion": "/app"
                    },
                    {
                        "actual": ".",
                        "autoFix": true,
                        "message": "Warning: at service express-app-container.build",
                        "name": "NOT_SUPPORTED",
                        "requireManuallyFix": false,
                        "suggestion": "Replace with image"
                    }
                ]);
                compose.fixWarnings();
                expect(compose.getWarnings()).to.be.deep.equal([
                    {
                        "actual": "./:/app",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.volumes",
                        "name": "NO_PERMISSION",
                        "requireManuallyFix": true,
                        "suggestion": "/app"
                    },  {
                        "actual": "express-app-container:latest",
                        "autoFix": false,
                        "message": "Warning: at service express-app-container.image",
                        "name": "LACK_OF_DETAILS_OWNER_NAME",
                        "requireManuallyFix": true,
                        "suggestion": ""
                    }
                ]);

            });

            it('Should fix all warnings and translate without calling getWarnings', () => {
                const filePath = `${__dirname}/ComposeV1/ex1.yaml`;
                const compose  = CFComposeModel.load(filePath);
                compose.fixWarnings();
                expect(compose.translate()).to.be.deep.equal(`dbpostgres:
  ports:
    - '5432'
  image: 'postgres:9.4'
  volumes_from:
    - dbstore
express-app-container:
  ports:
    - '3000'
  volumes:
    - './:/app'
  links:
    - dbpostgres
  image: 'express-app-container:latest'
`);
            });
        });
    });

    describe('Parse', () => {

    });

    describe('Init', () => {

        it('Init empty compose model', () => {
            const compose = new CFComposeModel(); // jshint ignore:line

        });

    });

});

