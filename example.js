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
        // './lib/model/tests/ComposeV1/ex1.yaml',
        './test-compose.yaml',
        // './lib/model/tests/ComposeV2/ex1.yaml',
        // './lib/model/parsers/tests/yamls/ComposeV1/ex1.image.yaml'
    ];
    return Promise.mapSeries(paths, (location) => {
        console.log(`\n#############################\nExample load yaml from location ${location}\n#############################`);

        location = path.resolve(__dirname, location);
        let cm;
        return ComposeModel.load(location)
            .then(compose => {
                cm = compose;
                return compose.getWarnings();
            })
            .then((warnings) => {

                console.log('\n===\nWarnings\n===');
                return Promise.map(warnings, (warning) => {
                    console.log(warning.format());
                });

            })
            .then(() => {
                return cm.translate().toYaml();
            })
            .then((translated) => {
                console.log('\n===\nOutput\n===');
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
    console.log(`\n#############################\nExample from scratch\n#############################`);

    const cm      = new ComposeModel();
    const service = new Service('os')
        .setImage('ubuntu')
        .addPort('80:80')
        .addVolume('./app:/core')
        .addEnvironmentVariable('TIME', Date.now())
        .setAdditionalData('dockerfile', './Dockerfile');
    cm.addService(service);
    return cm.translate(CM.translators.ComposeV1).toYaml()
        .then(translated => {
            console.log('\n===\nOutput before fixing warnings\n===');
            console.log(translated);
        })
        .then(() => {
            return cm.getWarnings();
        })
        .then(warnings => {
            console.log('\n===\nWarnings\n===');
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
            console.log('\n===\nWarnings after calling fix warnings\n===');
            return Promise.map(warnings, (warning) => {
                console.log(warning.format());
            });
        })
        .then(() => {
            return cm.translate(CM.translators.ComposeV1).toYaml();
        })
        .then(translated => {
            console.log('\n===\nOutput after fixing warnings\n===');
            console.log(translated);
        });
}

Promise.resolve()
    .then(withYamlFiles)
    .then(fromScratch)
    .done();




