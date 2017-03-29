var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf')
};

exports.get = handleGet;

function handleGet(req) {
    var component = libs.portal.getComponent();
    var view = resolve('cta.html');
    var model = createModel();

    function createModel() {
        var model = {};

        model.buttonText = component.config.buttonText;
        model.image = component.config.image;

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}