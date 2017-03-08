```
'use strict';

const CM                  = require('cf-compose-model');
const ComposeModel        = CM.ComposeModel;
const fs                  = require('fs');
const ComposeV2Translator = CM.translators.ComposeV2;

const paths = [
    'node_modules/cf-compose-model/lib/model/tests/ComposeV1/ex1.yaml',
    'node_modules/cf-compose-model/lib/model/tests/ComposeV1/ex2.yaml',
    'node_modules/cf-compose-model/lib/model/tests/ComposeV2/ex1.yaml',
];

paths.map((path) => {
    console.log(`Loaded path ${path}`);
    const compose = ComposeModel.load(path);
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

paths.map(path => {
    const yamlStr = fs.readFileSync(path, 'utf8');
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
const Image = CM.components.leafs.Image;
const image = new Image.ImageBuilder()
    .buildOwner('codefresh-io')
    .buildRepo('cf-compose-model')
    .build();

//Create Volume
const VolumeLeaf         = CM.components.leafs.Volume;
const volumeLeafInstance = new VolumeLeaf.VolumeBuilder()
    .buildTarget('/app')
    .build();

//Create Port
const Port = CM.components.leafs.Port;
const port = new Port.PortBuilder()
    .buildTarget('80')
    .build();

console.log(image.toString());
console.log(volumeLeafInstance.toString());
console.log(port.toString());

//Create Service
const Service = CM.components.nodes.Service;
const service = new Service('db', {
    image: image,
    ports: [port]
});

const VolumeNode         = CM.components.nodes.Volume;
const volumeNodeInstance = new VolumeNode('db-driver', { driver: 'flocker' });

const Network = CM.components.nodes.Network;
const network = new Network('front', { driver: 'overlay' });

const cm           = new ComposeModel();
cm.addService(service);
cm.addVolume(volumeNodeInstance);
cm.addNetwork(network);
console.log(cm.translate(ComposeV2Translator));


```
