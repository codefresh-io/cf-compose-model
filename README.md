# Codefresh Compose Model

[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=codefresh-io&repoName=cf-compose-model&branch=master&pipelineName=cf-compose-model&accountName=codefresh-inc&type=cf-2)]( https://g.codefresh.io/repositories/codefresh-io/cf-compose-model/builds?filter=trigger:build;branch:master;service:58b4563445a0ac0100a91975~cf-compose-model)

Codefresh introducing CF-Compose-Model, our model for all compositions.
Using our compose model you can:
 * Verify that your composition is valid on Codefresh.io
 * Convert Composition from one type to another
 
 
# Example
More examples can be found here:  
* `node example.js` to run the basic examples we provided

```javascript

'use strict';

const Promise      = require('bluebird');
const path         = require('path');
const CM           = require('cf-compose-model');
const ComposeModel = CM.ComposeModel;

    const path = './lib/model/tests/ComposeV1/ex1.yaml';

    console.log(`\n#############################\nExample load yaml from location ${locapathtion}\n#############################`);

    let location = path.resolve(__dirname, path);
    return ComposeModel.load(location)
        .then(compose => {
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
````



# Installation
* run `npm install cf-compose-mode --save`
OR
* clone this repo and `npm isntall`, `yarn` also supported

# [Api reference](./Usage.md)

# [Getting started]('./GettingStarted)

# Test



# Road-map:
- [X] Support Compose V1
- [X] Support Compose V2
- [X] Support Compose V3
- [ ] CLI tool
- [ ] ES5 module




