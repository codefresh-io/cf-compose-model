'use strict';
const Base = require('./Base');

class Pro extends Base {
    activate(compose) {
        compose.allowPortMapping();
        compose.allowServiceVolumeMapping();
        compose.allowGlobalVolumeUsage();
    }
}

module.exports = new Pro();