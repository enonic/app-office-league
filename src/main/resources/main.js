var initLib = require('/lib/office-league-init');
var testDataLib = require('/lib/test-data');

log.info('Office League app started');

initLib.initialize();

__.disposer(function () {
    log.info('Office League app stopped');
});

if (!app.config['skip-test-data']) {
    testDataLib.createTestData();
}
