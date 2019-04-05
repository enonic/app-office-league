var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/thymeleaf'),
    util: require('/lib/util')
};

// Handle GET request
exports.get = handleGet;

function handleGet(req) {
    var component = libs.portal.getComponent(); // Current component
    var view = resolve('layout-1-col.html');
    var model = createModel();

    function createModel() {
        var model = {};
        model.mainRegion = component.regions['main'];
        model.regions = libs.util.region.get();
        model.component = component;

        model.layoutClass += component.config.paddingTop ? ' layout-1-col--padding-top' : '';
        model.layoutClass += component.config.paddingBottom ? ' layout-1-col--padding-bottom' : '';
        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}