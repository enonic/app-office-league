var graphQlLib = require('/lib/officeleague/graphql');

exports.handednessEnumType = graphQlLib.createEnumType({
    name: 'Handedness',
    description: 'Enumeration of handedness',
    values: {
        right: 'right',
        left: 'left',
        ambidexterity: 'ambidexterity'
    }
});

exports.sideEnumType = graphQlLib.createEnumType({
    name: 'Side',
    description: 'Enumeration of sides',
    values: {
        blue: 'blue',
        red: 'red'
    }
});

exports.sportEnumType = graphQlLib.createEnumType({
    name: 'Sport',
    description: 'Enumeration of sports handled',
    values: {
        foos: 'foos'
    }
});
