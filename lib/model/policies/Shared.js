'use strict';
const Base = require('./Base');

class Shared extends Base {
    activate(composeModel){
        composeModel.disallowPortMapping();
        composeModel.disallowServiceVolumeMapping();
        composeModel.disallowGlobalVolumeUsage();
        composeModel.setupPredefinedVolumes(['${{CF_VOLUME}}', '${{CF_VOLUME_NAME}}']);
    }
}

module.exports = new Shared();