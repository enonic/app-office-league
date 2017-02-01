log.info('Application ' + app.name + ' started');

__.disposer(function() {
    log.info('Application ' + app.name + ' stopped');
});