exports.createNewSlackMessage = function(data) {
    if (data.finished) {
        return createFinishedGameMessage(data);
    } else {
        return createNewGameMessage(data);
    }
}

/**
 * Formats the finished game to a slack message format
 */
function createFinishedGameMessage(data) {
    const message = {
        "blocks": []
    };

    let matchResult;
    let ratingResult;

    if (data.playerCount > 2) {
        matchResult = formatWinning(data.teams);
        ratingResult = [].concat(
            ratingContext(data.teams),
            ratingContextPlayers(data.players)
        );
    }
    else {
        matchResult = formatWinning(data.players);
        ratingResult = ratingContext(data.players);
    }

    message.blocks.push(
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": `Game finished in ${data.league.name}`
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": matchResult
                }
            ]
        }
    );

    message.blocks = message.blocks.concat(ratingResult);

    return message;
}

/**
 * Formats the new game to a slack message format
 * @returns Object
 */
function createNewGameMessage(data) {
    const message = {
        "blocks": []
    };

    const blueExpected = data.sides.blue.expectedScore;
    const redExpected = data.sides.red.expectedScore;

    message.blocks.push(
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": `New game in  ${data.league.name}`
            }
        }
    );

    if (data.playerCount > 2) {
        message.blocks.push(
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": formatExpected(data.teams, redExpected, blueExpected),
                    },
                ]
            }
        );

        message.blocks = message.blocks.concat(createTeamSection(data));
    } else {
        const sides = getSides(data.players);

        message.blocks.push(
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": formatExpected(data.players, redExpected, blueExpected),
                    },
                ]
            },
            createPlayerSection(sides.red[0]),
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "*VS*"
                    }
                ]
            },
            createPlayerSection(sides.blue[0])
        );
    }

    return message;
}

/**
 * Method for formating the expected message
 * @param {Array<Object>} group - player or team
 * @param {string|number} expectedScoreWinner - The winners expected score
 * @param {string|number} expectedscoreLoser - The losing teams expected score
 */
function formatExpected(group, expectedRed, expectedBlue) {
    let expectedName;
    let expectedScoreWinner;
    let expectedScoreLoser;
    if (expectedRed > expectedBlue) {
        expectedName = group[0].side == 'red' ? group[0].name : group[1].name;
        expectedScoreWinner = expectedRed;
        expectedScoreLoser = expectedBlue;
    }
    else {
        expectedName = group[0].side == 'blue' ? group[0].name : group[1].name;
        expectedScoreWinner = expectedBlue;
        expectedScoreLoser = expectedRed;
    }

    return `${expectedName} is expected to win ${expectedScoreWinner} to ${expectedScoreLoser} goals`;
}

/**
 * Formats a message with the team that won the match and the score
 * @param {Array<object>} opponents - Team or players
 */
function formatWinning(opponents) {
    const winner = opponents[0].score > opponents[1].score ? opponents[0] : opponents[1];
    const loser = opponents[1].score > opponents[0].score ? opponents[0] : opponents[1];
    return `${winner.name} defeats ${loser.name} ${winner.score} - ${loser.score}`;
}

/**
 * Formats a message of diff in rating
 * @param {Array<object>} opponents - Team or players
 */
function ratingContext(opponents) {
    const winner = opponents[0].score > opponents[1].score ? opponents[0] : opponents[1];
    const loser = opponents[1].score > opponents[0].score ? opponents[0] : opponents[1];

    const context = [
        imageAndTextContext(winner),
        imageAndTextContext(loser)
    ];

    return context;
}

/**
 *
 * @param {object} profile Team or player profile
 * @param {boolean} context If the context should be inlcuded or elements/fields only
 * @returns {object|Array} Based on the context boolean
 */
function imageAndTextContext(profile) {
    const winLose = profile.ratingDelta < 0 ? '⬇️' : '⬆️';
    const elements = [
        {
            "type": "image",
            "image_url": `${profile.imageUrl}`,
            "alt_text": `Profile image of ${profile.name}`
        },
        {
            "type": "mrkdwn",
            "text": `${profile.name} ${winLose} ${profile.ratingDelta} point${profile.ratingDelta == 1 || profile.ratingDelta == -1 ? '' : 's'}. New rating ${profile.rating}\n`
        },
    ];


    return {
        "type": "context",
        "elements": elements
    };
}

function ratingContextPlayers(players) {
    let blocks = [];

    for (const player of players) {
        blocks = blocks.concat(imageAndTextContext(player));
    };

    return blocks;
}

function createVsTeamSection(players) {
    const sides = getSides(players);
    const red = sides.red;
    const blue = sides.blue;

    return {
        "type": "context",
        "elements": [
            {
                "type": "image",
                "image_url": `${red[0].imageUrl}`,
                "alt_text": `Profile image of ${red[0].name}`
            },
            {
                "type": "image",
                "image_url": `${red[1].imageUrl}`,
                "alt_text": `Profile image of ${red[1].name}`
            },
            {
                "type": "mrkdwn",
                "text": "*VS*"
            },
            {
                "type": "image",
                "image_url": `${blue[0].imageUrl}`,
                "alt_text": `Profile image of ${blue[0].name}`
            },
            {
                "type": "image",
                "image_url": `${blue[1].imageUrl}`,
                "alt_text": `Profile image of ${blue[1].name}`
            }
        ]
    };
}

function createPlayerSection(player) {
    return {
        "type": "section",
        "fields": [
            {
                "type": "mrkdwn",
                "text": `*${player.name}* ${player.rating}`
            },
        ],
        "accessory": {
            "type": "image",
            "image_url": `${player.imageUrl}`,
            "alt_text": `Profile image of ${player.name}`
        }
    }
}

function createTeamSection(gameData) {
    const sidePlayers = getSides(gameData.players);
    const red = {
        team: gameData.teams[0].side == 'red' ? gameData.teams[0] : gameData.teams[1],
        players: sidePlayers.red
    };

    const blue = {
        team: gameData.teams[0].side == 'blue' ? gameData.teams[0] : gameData.teams[1],
        players: sidePlayers.blue
    };

    return [
        createTeamSectionSide(red.team, red.players),
        createVsTeamSection(gameData.players),
        createTeamSectionSide(blue.team, blue.players)
    ];
}

function createTeamSectionSide(team, players) {
    return {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `*${team.name}* ${team.rating}`
        },
        "fields": [
            {
                "type": "mrkdwn",
                "text": `*${players[0].name}* ${players[0].rating}`
            },
            {
                "type": "mrkdwn",
                "text": `*${players[1].name}* ${players[1].rating}`
            }
        ],
        "accessory": {
            "type": "image",
            "image_url": `${team.imageUrl}`,
            "alt_text": `Profile image for ${team.name}`
        }
    };
}

function getSides(players) {
    let red = [];
    let blue = [];

    for (const player of players) {
        if (player.side == 'red') {
            red.push(player);
        } else {
            blue.push(player);
        }
    }

    return {
        red,
        blue,
    }
}