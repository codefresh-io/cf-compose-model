'use strict';

const path         = require('path');
const CM           = require('./');
const ComposeModel = CM.ComposeModel;
const Service      = CM.components.Service; // jshint ignore:line

/*Examples*/

const paths = [
    './lib/model/tests/ComposeV1/ex1.yaml',
    './lib/model/tests/ComposeV2/ex2.yaml',
    './lib/model/parsers/tests/yamls/ComposeV1/ex1.image.yaml'
];
paths.map((location) => {

    console.log(`#############################`);
    console.log(`Example load yaml from location ${location}`);


    location = path.resolve(__dirname, location);
    console.log(`Loaded path ${location}`);
    ComposeModel.load(location)
        .then(compose => {
            return compose.getErrorsAndWornings();
        })
        .then((errors) => {
            console.log(errors);
        });
});

console.log(`Example starting from scratch`);
console.log(`#############################`);

const cm      = new ComposeModel();
const service = new Service('os')
    .setImage('ubuntu')
    .addPort('80:80')
    .addVolume('./app:/core')
    .addEnvironmentVariable('TIME', Date.now())
    .setAdditionalData('dockerfile', './Dockerfile');
cm.addService(service);
cm.translate(CM.translators.ComposeV1)
    .then(translated => {
        console.log(translated);
    })
    .then(() => {
        return cm.getWarnings();
    })
    .then(warnings => {
        console.log(warnings);
    })
    .then(() => {
        return cm .fixWarnings();
    })
    .then(() => {
        return cm.getWarnings();
    })
    .then(warnings => {
        console.log(warnings);
    })
    .then(() => {
        return cm.translate(CM.translators.ComposeV1);
    })
    .then(translated => {
        console.log(translated);
    });
