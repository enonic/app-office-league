var initLib = require('/lib/office-league-init');
var testDataLib = require('/lib/test-data');
var maintenanceTaskLib = require('/lib/maintenance-tasks');

log.info('Office League app started');

initLib.initialize();

__.disposer(function () {
    log.info('Office League app stopped');
    maintenanceTaskLib.cancelGameGCTask();
});

if (!app.config['skip-test-data']) {
    testDataLib.createTestData();
}

maintenanceTaskLib.launchGameGCTask();