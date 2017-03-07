'use strict';
const leafs = ['Image', 'Port', 'Volume'];
const allLeafs = {};
leafs.map((value) => {
    allLeafs[value] = require(`./${value}.js`);
});
module.exports = allLeafs;
