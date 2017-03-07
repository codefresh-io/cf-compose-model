'use strict';
const nodes = ['Service'];
const allNodes = {};
nodes.map((value) => {
    allNodes[value] = require(`./${value}.js`);
});
module.exports = allNodes;
