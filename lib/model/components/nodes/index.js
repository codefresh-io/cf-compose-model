'use strict';
const nodes = ['Service', 'Network', 'Volume'];
const allNodes = {};
nodes.map((value) => {
    allNodes[value] = require(`./${value}.js`);
});
module.exports = allNodes;
