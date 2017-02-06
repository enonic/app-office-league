var initLib = require('/lib/office-league-init');

log.info('Application ' + app.name + ' started');

initLib.initialize();

__.disposer(function () {
    log.info('Application ' + app.name + ' stopped');
});

