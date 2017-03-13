'use strict';

const path = require('path');
const fs   = require('fs');

// Replace with when running outside of the module
// const CM = require('cf-compose-model');
const CM                  = require('./');
const ComposeModel        = CM.ComposeModel;
const ComposeV2Translator = CM.translators.ComposeV2;

const paths = [
    './lib/model/tests/ComposeV1/ex1.yaml',
    './lib/model/tests/ComposeV1/ex2.yaml',
    './lib/model/tests/ComposeV2/ex1.yaml',
];


paths.map((location) => {
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

paths.map((location) => {
    location      = path.resolve(__dirname, location);
    const yamlStr = fs.readFileSync(location, 'utf8');
    const compose = ComposeModel.parse(yamlStr);
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


/*Examples*/


//Create Image
const Image = CM.components.Image;
const image = new Image()
    .setOwner('codefresh-io')
    .setRepo('cf-compose-model');

//Create Volume
const Volume         = CM.components.Volume;
const volumeInstance = new Volume()
    .setTarget('/app');

//Create Port
const Port = CM.components.Port;
const port = new Port().setTarget('80');

console.log(image.toString());
console.log(volumeInstance.toString());
console.log(port.toString());

//Create Service
const Service = CM.components.Service;

const service = new Service('db');
service.setImage(image);
service.addPort(port);

const GlobalVolume        = CM.components.GlobalVolume;
const globalVolumeInstace = new GlobalVolume('db-driver', { driver: 'flocker' });

const Network = CM.components.Network;
const network = new Network('front', { driver: 'overlay' });

const cm = new ComposeModel();
cm.addService(service);
cm.addVolume(globalVolumeInstace);
cm.addNetwork(network);
console.log(cm.translate(ComposeV2Translator));
