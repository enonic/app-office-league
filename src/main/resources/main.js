var initLib = require('/lib/office-league-init');
var testDataLib = require('/lib/test-data');
var maintenanceTaskLib = require('/lib/maintenance-tasks');
var webhooks = require('/lib/webhooks');
var gameNotifications = require('/lib/game-notifications');

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

webhooks.setupWebHooks();
// Currently not working
// gameNotifications.setupPushNotifications();
