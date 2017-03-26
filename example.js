'use strict';

const path         = require('path');
const CM           = require('./');
const ComposeModel = CM.ComposeModel;
const Service      = CM.components.Service;

const Promise      = require('bluebird'); // jshint ignore:line

/**
 * In this example the compose model will be initiate using existing yamls
 * The first step is to load the yaml, using ComposeModel.load
 * After that showing all the warnings and errors that might be on the yaml using getErrorsAndWarnings
 * The last step is to translate is back to the same yaml using translate method
 */
function withYamlFiles() {
    const paths = [
        './lib/model/tests/ComposeV1/ex1.yaml',
        './lib/model/tests/ComposeV2/ex1.yaml',
        './lib/model/parsers/tests/yamls/ComposeV1/ex1.image.yaml'
    ];
    return Promise.map(paths, (location) => {

        console.log(`#############################`);
        console.log(`Example load yaml from location ${location}`);


        location = path.resolve(__dirname, location);
        console.log(`Loaded path ${location}`);
        let cm;
        return ComposeModel.load(location)
            .then(compose => {
                cm = compose;
                return compose.getErrorsAndWarnings();
            })
            .then((errorsAndWarnings) => {
                const errors = errorsAndWarnings.errors;
                const warnings = errorsAndWarnings.warnings;
                return Promise.map(warnings, (warning) => {
                    console.log(warning.format());
                })
                    .then(() => {
                        return Promise.map(errors, (error) => {
                            console.log(error.format());
                        });
                    });

            })
            .then(() => {
                return cm.translate();
            })
            .then((translated) => {
                console.log(translated);
            });

    });
}


/**
 * In this example the compose model initiate from scratch
 * The first step is to init new ComposeModel
 * After that will create new service with image, port, volume, environment variable and more additional data
 * The service should be added to the model using addService
 * At this point the ComposeModel is ready for use
 * translate can be called with any translator to get the ComposeModel translate to the specific version
 * All the translator can be found at require('cf-compose-model').translators
 * @return {*}
 */
function fromScratch() {
    const cm      = new ComposeModel();
    const service = new Service('os')
        .setImage('ubuntu')
        .addPort('80:80')
        .addVolume('./app:/core')
        .addEnvironmentVariable('TIME', Date.now())
        .setAdditionalData('dockerfile', './Dockerfile');
    cm.addService(service);
    return cm.translate(CM.translators.ComposeV1)
        .then(translated => {
            console.log(translated);
        })
        .then(() => {
            return cm.getWarnings();
        })
        .then(warnings => {
            return Promise.map(warnings, (warning) => {
                console.log(warning.format());
            });
        })
        .then(() => {
            return cm.fixWarnings();
        })
        .then(() => {
            return cm.getWarnings();
        })
        .then(warnings => {
            return Promise.map(warnings, (warning) => {
                console.log(warning.format());
            });
        })
        .then(() => {
            return cm.translate(CM.translators.ComposeV1);
        })
        .then(translated => {
            console.log(translated);
        });
}

Promise.resolve()
    .then(withYamlFiles)
    .then(fromScratch)
    .done();




