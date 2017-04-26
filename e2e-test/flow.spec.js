'use strict';

const fs      = require('fs');
const path    = require('path');
const _       = require('lodash');
const YAML    = require('js-yaml');
const Promise = require('bluebird'); // jshint ignore:line
const steps   = require('./steps');



const flowFileName = 'flow.yaml';

const runTest = require('./').run;

const folderIterator = (folderPath) => {
    console.log(`checking folder: ${folderPath} for flow tests to run`);
    const dirContent = fs.readdirSync(folderPath);
    _.forEach(dirContent, (cont) => {
        const contPath  = path.resolve(folderPath, cont);
        const contStats = fs.statSync(contPath);
        if (contStats.isDirectory()) {
            folderIterator(contPath);
        } else if (cont === flowFileName) {
            it(`${contPath}/${flowFileName}`, function () {
                runTest(folderPath, flowFileName);
            })
        }
    });
};

describe('Compose Model Flow Tests', () => {
    folderIterator(`${__dirname}/tests`);
});
