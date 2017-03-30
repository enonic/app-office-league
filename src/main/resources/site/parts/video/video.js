var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf')
};

exports.get = handleGet;

function handleGet(req) {
    var component = libs.portal.getComponent();
    var view = resolve('video.html');
    var model = createModel();

    function createModel() {
        var model = {};

        model.title = component.config.title;
        model.buttonText = component.config.buttonText;

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}