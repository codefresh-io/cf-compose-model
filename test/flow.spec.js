'use strict';

const fs   = require('fs');
const path = require('path');
const _    = require('lodash');

const flowFileName = 'flow.json';

const folderIterator = (folderPath) => {
    console.log(`checking folder: ${folderPath} for flow tests to run`);
    const dirContent = fs.readdirSync(folderPath);
    _.forEach(dirContent, (cont) => {
        const contPath  = path.resolve(folderPath, cont);
        const contStats = fs.statSync(contPath);
        if (contStats.isDirectory()) {
            folderIterator(contPath);
        } else if (cont === flowFileName) {
            runTest(folderPath);
        }
    });
};

const runTest = (folderPath) => {
    console.log(`running test from folder: ${folderPath}`);
    const flowFilePath = path.resolve(folderPath, flowFileName);
    let flow           = fs.readFileSync(flowFilePath);
    try {
        flow = JSON.parse(flow);
    } catch (err) {
        console.error(`Failed to parse flow file: ${flowFilePath}. error: ${err.toString()}`);
    }

    it(flow.name, function () {

    });
};

describe('Compose Model Flow Tests', () => {
    folderIterator(__dirname);
});
