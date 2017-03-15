'use strict';

const path         = require('path');
const CM           = require('./');
const ComposeModel = CM.ComposeModel;
const Service      = CM.components.Service;

/*Examples*/

const paths = [
    './lib/model/tests/ComposeV1/ex1.yaml',
    './lib/model/tests/ComposeV2/ex1.yaml',
];

paths.map((location) => {

    console.log(`#############################`);
    console.log(`Example load yaml from location ${location}`);


    location = path.resolve(__dirname, location);
    console.log(`Loaded path ${location}`);
    const compose = ComposeModel.load(location);
    console.log('Parsed');
    console.log('Show warnings');
    console.log(compose.getWarnings());

    console.log('Fix warnings');
    compose.fixWarnings();

    console.log('Show warnings after fix');
    console.log(compose.getWarnings());

    console.log('Translate with default translator');
    console.log(compose.translate());
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
const translated = cm.translate(CM.translators.ComposeV1);
console.log(translated);
console.log(cm.getWarnings());
cm.fixWarnings();
console.log(cm.getWarnings());
console.log(cm.translate(CM.translators.ComposeV1));
