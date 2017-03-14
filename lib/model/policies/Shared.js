'use strict';
const Base = require('./Base');

class Shared extends Base {
    activate(composeModel){
        composeModel.disallowPortMapping();
        composeModel.disallowServiceVolumeMapping();
        composeModel.disallowGlobalVolumeUsage();
    }
}

module.exports = new Shared();