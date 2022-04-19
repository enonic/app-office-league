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

    let matchResult = "";
    let ratingResult = "";

    if (data.playerCount > 2) {
        matchResult = formatWinning(data.teams);
        ratingResult = formatRating(data.teams) + "\n" + formatRatingPlayers(data.players);
    }
    else {
        matchResult = formatWinning(data.players);
        ratingResult = formatRating(data.players);
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
                },

            ]
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": ratingResult
                },
            ]
        }
    );

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

        message.blocks.concat(createTeamSection(data));
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
 * Method for formating the expted message
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
function formatRating(opponents) {
    const winner = opponents[0].score > opponents[1].score ? opponents[0] : opponents[1];
    const loser = opponents[1].score > opponents[0].score ? opponents[0] : opponents[1];

    return `${winner.name} wins ${winner.ratingDelta} points. New rating ${winner.rating}\n` +
           `${loser.name} loses ${loser.ratingDelta} points. New rating ${loser.rating}`;
}

function formatRatingPlayers(players) {
    let playerRatingText = "";

    for (const player in players) {
        const winLose = player.ratingDelta < 0 ? 'lose' : 'wins';
        playerRatingText += `${player.name} ${winLose} ${player.ratingDelta} points. New rating ${player.rating}\n`
    }

    return playerRatingText;
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