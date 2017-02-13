var nodeLib = require('/lib/xp/node');
var valueLib = require('/lib/xp/value');
var ratingLib = require('/lib/office-league-rating');

var REPO_NAME = 'office-league';
var LEAGUES_PATH = '/leagues';
var PLAYERS_PATH = '/players';
var TEAMS_PATH = '/teams';
var LEAGUE_GAMES_REL_PATH = '/games';
var LEAGUE_PLAYERS_REL_PATH = '/players';
var LEAGUE_TEAMS_REL_PATH = '/teams';

var TYPE = {
    PLAYER: 'player',
    TEAM: 'team',
    GAME: 'game',
    GAME_PLAYER: 'gamePlayer',
    GAME_TEAM: 'gameTeam',
    LEAGUE: 'league',
    LEAGUE_PLAYER: 'leaguePlayer',
    LEAGUE_TEAM: 'leagueTeam',
    COMMENT: 'comment'
};

/**
 * @typedef {Object} Attachment
 * @property {string} name Attachment name.
 * @property {string} [label] Attachment label.
 * @property {binary} binary Binary stream.
 * @property {string} mimeType Mime type of the attachment.
 * @property {number} size Size of the attachment in bytes.
 */

/**
 * @typedef {Object} League
 * @property {string} name Name of the league.
 * @property {string} sport Sport id (e.g. 'foos')
 * @property {string} description League description text.
 * @property {string} image Attachment name of the league's image.
 * @property {Object} config League config.
 * @property {Attachment|Attachment[]} [attachment] League attachments.
 */

/**
 * @typedef {Object} LeagueResponse
 * @property {League[]} leagues Array of league objects.
 * @property {number} count Total number of leagues.
 * @property {number} total Count of leagues returned.
 */

/**
 * @typedef {Object} Player
 * @property {string} type Object type: 'player'
 * @property {string} name Name of the player.
 * @property {string} nickname Nickname of the player.
 * @property {string} image Attachment name of the player's image.
 * @property {string} nationality 2 letter country code of the player (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
 * @property {string} handedness Player handedness: 'right', 'left', 'ambidexterity.
 * @property {string} description Description text.
 * @property {Attachment|Attachment[]} [attachment] Player attachments.
 */

/**
 * @typedef {Object} PlayerResponse
 * @property {Player[]} players Array of player objects.
 * @property {number} count Total number of players.
 * @property {number} total Count of players returned.
 */

/**
 * @typedef {Object} Team
 * @property {string} type Object type: 'team'
 * @property {string} name Name of the team.
 * @property {string} image Attachment name of the team's image.
 * @property {string} description Description text.
 * @property {string[]} playerIds Array with ids of the team players.
 * @property {Attachment|Attachment[]} [attachment] Team attachments.
 */

/**
 * @typedef {Object} TeamResponse
 * @property {Team[]} teams Array of team objects.
 * @property {number} count Total number of teams.
 * @property {number} total Count of teams returned.
 */

/**
 * @typedef {Object} LeaguePlayer
 * @property {string} type Object type: 'leaguePlayer'
 * @property {string} playerId Player id.
 * @property {string} leagueId League id.
 * @property {number} rating Ranking rating for the player in this league.
 */

/**
 * @typedef {Object} LeaguePlayerResponse
 * @property {LeaguePlayer[]} players Array of league player objects.
 * @property {number} count Total number of players in the league.
 * @property {number} total Count of players returned.
 */

/**
 * @typedef {Object} LeagueTeam
 * @property {string} type Object type: 'leagueTeam'
 * @property {string} teamId Team id.
 * @property {string} leagueId League id.
 * @property {number} rating Ranking rating for the team in this league.
 */

/**
 * @typedef {Object} LeagueTeamResponse
 * @property {LeagueTeam[]} teams Array of league team objects.
 * @property {number} count Total number of teams in the league.
 * @property {number} total Count of teams returned.
 */

/**
 * @typedef {Object} Point
 * @property {string} playerId Player that scored the point.
 * @property {number} time Time offset in seconds since the beginning of the game.
 * @property {boolean} against True if the point was scored against its own player.
 */

/**
 * @typedef {Object} GameTeam
 * @property {string} type Object type: 'gameTeam'
 * @property {string} gameId Game id.
 * @property {string} teamId Team id.
 * @property {string} time Time offset in seconds since the beginning of the game.
 * @property {string} side Team side: 'blue' or 'red'.
 * @property {boolean} winner True if this team is the winner of the game.
 * @property {number} score Total score for this team in the game.
 * @property {number} scoreAgainst Total score against itself, for this team in the game.
 * @property {number} ratingDelta Increment in rating for this team ranking based to the game result.
 */

/**
 * @typedef {Object} GamePlayer
 * @property {string} type Object type: 'gamePlayer'
 * @property {string} gameId Game id.
 * @property {string} playerId Player id.
 * @property {string} time Time offset in seconds since the beginning of the game.
 * @property {string} side Player side: 'blue' or 'red'.
 * @property {boolean} winner True if this player is the winner of the game.
 * @property {number} score Total score for this player in the game.
 * @property {number} scoreAgainst Total score against itself, for this player in the game.
 * @property {number} ratingDelta Increment in rating for this player ranking based to the game result.
 */

/**
 * @typedef {Object} Game
 * @property {string} type Object type: 'game'
 * @property {string} leagueId League id.
 * @property {string} time Date and time when the game was started. An ISO-8601-formatted instant (e.g '2011-12-03T10:15:30Z').
 * @property {boolean} finished True if the game is completed, false if the game is still in progress.
 * @property {Point[]} points Array of points scored during the game.
 * @property {GamePlayer[]} gamePlayers Array with the players and its properties for this game.
 * @property {GameTeam[]} gameTeams Array with the teams and its properties for this game.
 */

/**
 * @typedef {Object} GamesResponse
 * @property {Game[]} games Array of game objects.
 * @property {number} count Total number of games.
 * @property {number} total Count of games returned.
 */

/**
 * @typedef {Object} Comment
 * @property {string} type Object type: 'comment'
 * @property {string} text Comment text.
 * @property {string} gameId Game id.
 * @property {string} author Player id.
 * @property {string} media Binary name of the league's image.
 * @property {string} mediaType Mime type of the league's image.
 */

/**
 * @typedef {Object} CommentsResponse
 * @property {Comment[]} comments Array of game comment objects.
 * @property {number} count Total number of comments.
 * @property {number} total Count of comments returned.
 */

/**
 * Retrieve a list of leagues.
 * @param  {number} [start=0] First index of the leagues.
 * @param  {number} [count=10] Number of leagues to fetch.
 * @return {LeagueResponse} Leagues.
 */
exports.getLeagues = function (start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE + "'"
    });

    var leagues = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leagues = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "leagues": leagues
    };
};

/**
 * Retrieve a league by its id.
 * @param  {string} leagueId Id of the league.
 * @return {League} League object or null if not found.
 */
exports.getLeagueById = function (leagueId) {
    var repoConn = newConnection();

    var obj = repoConn.get(leagueId);
    return obj && (obj.type === TYPE.LEAGUE) ? obj : null;
};

/**
 * Retrieve a league by its name.
 * @param  {string} name Name of the league.
 * @return {League} League object or null if not found.
 */
exports.getLeagueByName = function (name) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.LEAGUE + "' AND name='" + name + "'"
    });

    var league;
    if (result.count > 0) {
        var id = result.hits[0].id;
        league = repoConn.get(id);
    }

    return league;
};

/**
 * Retrieve a list of league players and their rating points in the ranking.
 * @param  {string} leagueId League id.
 * @param  {number} [start=0] First index of the players.
 * @param  {number} [count=10] Number of players to fetch.
 * @return {LeaguePlayerResponse} League players.
 */
exports.getLeaguePlayersByLeagueId = function (leagueId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND leagueId='" + leagueId + "'",
        sort: "rating DESC, name ASC"
    });

    var leaguePlayers = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leaguePlayers = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "players": leaguePlayers
    };
};

/**
 * Retrieve a list of league players and their rating points in the ranking.
 * @param  {string} playerId Player id.
 * @param  {number} [start=0] First index of the players.
 * @param  {number} [count=10] Number of players to fetch.
 * @return {LeaguePlayerResponse} League players.
 */
exports.getLeaguePlayersByPlayerId = function (playerId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND playerId='" + playerId + "'",
        sort: "rating DESC, name ASC"
    });

    var leaguePlayers = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leaguePlayers = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "players": leaguePlayers
    };
};

/**
 * Retrieve a list of league players and their rating points in the ranking.
 * @param  {string} leagueId League id.
 * @param  {string[]} playerIds Player ids.
 * @return {LeaguePlayer[]} League players.
 */
exports.getLeaguePlayersByLeagueIdAndPlayerIds = function (leagueId, playerIds) {
    var repoConn = newConnection();

    playerIds = playerIds || [];
    var playersCondition = playerIds.map(function (id) {
        return "playerId='" + id + "'";
    }).join(' OR ');
    var result = repoConn.query({
        start: 0,
        count: playerIds.length,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND (" + playersCondition + ")"
    });

    var leaguePlayers = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leaguePlayers = [].concat(repoConn.get(ids));
    }

    return leaguePlayers;
};

/**
 * Retrieve a list of league teams and their rating points in the ranking.
 * @param  {string} leagueId League id.
 * @param  {string[]} teamIds Team ids.
 * @return {LeagueTeam[]} League teams.
 */
exports.getLeagueTeamsByLeagueIdAndTeamIds = function (leagueId, teamIds) {
    var repoConn = newConnection();

    teamIds = teamIds || [];
    var teamsCondition = teamIds.map(function (id) {
        return "teamId='" + id + "'";
    }).join(' OR ');
    var result = repoConn.query({
        start: 0,
        count: teamIds.length,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND (" + teamsCondition + ")"
    });

    var leagueTeams = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leagueTeams = [].concat(repoConn.get(ids));
    }

    return leagueTeams;
};

/**
 * Retrieve a list of league teams and their rating points in the ranking.
 * @param  {string} leagueId League id.
 * @param  {number} [start=0] First index of the teams.
 * @param  {number} [count=10] Number of teams to fetch.
 * @return {LeagueTeamResponse} League teams.
 */
exports.getLeagueTeamsByLeagueId = function (leagueId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND leagueId='" + leagueId + "'",
        sort: "rating DESC, name ASC"
    });

    var leagueTeams = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leagueTeams = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "teams": leagueTeams
    };
};

/**
 * Retrieve a list of league teams and their rating points in the ranking.
 * @param  {string} teamId Team id.
 * @param  {number} [start=0] First index of the teams.
 * @param  {number} [count=10] Number of teams to fetch.
 * @return {LeagueTeamResponse} League teams.
 */
exports.getLeagueTeamsByTeamId = function (teamId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND teamId='" + teamId + "'",
        sort: "rating DESC, name ASC"
    });

    var leagueTeams = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leagueTeams = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "teams": leagueTeams
    };
};

/**
 * Retrieve a list of players.
 * @param  {number} [start=0] First index of the players.
 * @param  {number} [count=10] Number of players to fetch.
 * @return {PlayerResponse} Players.
 */
exports.getPlayers = function (start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.PLAYER + "'"
    });

    var players = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        players = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "players": players
    };
};

/**
 * Search for players.
 * @param  {string} searchText Text search.
 * @param  {number} [start=0] First index of the players.
 * @param  {number} [count=10] Number of players to fetch.
 * @return {PlayerResponse} Players.
 */
exports.findPlayers = function (searchText, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.PLAYER + "' AND ngram('name^5,nickname^3,description^3', '" + searchText + "', 'AND')"
    });
    var players = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        players = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "players": players
    };
};

/**
 * Search for teams.
 * @param  {string} searchText Text search.
 * @param  {number} [start=0] First index of the teams.
 * @param  {number} [count=10] Number of teams to fetch.
 * @return {TeamResponse} Teams.
 */
exports.findTeams = function (searchText, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.TEAM + "' AND ngram('name^5,description^3', '" + searchText + "', 'AND')"
    });
    var teams = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        teams = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "teams": teams
    };
};

/**
 * Search for leagues.
 * @param  {string} searchText Text search.
 * @param  {number} [start=0] First index of the leagues.
 * @param  {number} [count=10] Number of leagues to fetch.
 * @return {LeagueResponse} Leagues.
 */
exports.findLeagues = function (searchText, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE + "' AND ngram('name^5,description^3', '" + searchText + "', 'AND')"
    });
    var leagues = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leagues = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "leagues": leagues
    };
};

/**
 * Retrieve a player by its id.
 * @param  {string} playerId Id of the player.
 * @return {Player} Player object or null if not found.
 */
exports.getPlayerById = function (playerId) {
    var repoConn = newConnection();

    var obj = repoConn.get(playerId);
    return obj && (obj.type === TYPE.PLAYER) ? obj : null;
};

/**
 * Retrieve a player by its name.
 * @param  {string} name Name of the player.
 * @return {Player} Player object or null if not found.
 */
exports.getPlayerByName = function (name) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.PLAYER + "' AND name='" + name + "'"
    });

    var player;
    if (result.count > 0) {
        var id = result.hits[0].id;
        player = repoConn.get(id);
    }

    return player;
};

/**
 * Retrieve a player image.
 * @param  {Player} player Player object.
 * @return {object} Player image stream.
 */
exports.getPlayerImageStream = function (player) {
    var repoConn = newConnection();

    var binaryStream = repoConn.getBinary({
        key: player._id,
        binaryReference: player.image
    });
    return binaryStream;
};

/**
 * Retrieve a team image.
 * @param  {Team} team Team object.
 * @return {object} Team image stream.
 */
exports.getTeamImageStream = function (team) {
    var repoConn = newConnection();

    var binaryStream = repoConn.getBinary({
        key: team._id,
        binaryReference: team.image
    });
    return binaryStream;
};

// exports.getPlayerImageUrl = function (playerId) {

/**
 * Retrieve a list of teams.
 * @param  {number} [start=0] First index of the teams.
 * @param  {number} [count=10] Number of teams to fetch.
 * @return {TeamResponse} Teams.
 */
exports.getTeams = function (start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.TEAM + "'"
    });

    var teams = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        teams = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "teams": teams
    };
};

/**
 * Retrieve a team by its id.
 * @param  {string} teamId Id of the team.
 * @return {Team} Team object or null if not found.
 */
exports.getTeamById = function (teamId) {
    var repoConn = newConnection();

    var obj = repoConn.get(teamId);
    return obj && (obj.type === TYPE.TEAM) ? obj : null;
};

/**
 * Retrieve a team by its players.
 * @param  {string} playerId1 Id of the 1st player in the team.
 * @param  {string} playerId2 Id of the 2nd player in the team.
 * @return {Team} Team object or null if not found.
 */
exports.getTeamByPlayerIds = function (playerId1, playerId2) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.TEAM + "' AND playerIds='" + playerId1 + "' AND playerIds='" + playerId2 + "'"
    });

    var team;
    if (result.count > 0) {
        var id = result.hits[0].id;
        team = repoConn.get(id);
    }

    return team;
};

/**
 * Retrieve a team by its name.
 * @param  {string} name Name of the team.
 * @return {Team} Team object or null if not found.
 */
exports.getTeamByName = function (name) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.TEAM + "' AND name='" + name + "'"
    });

    var team;
    if (result.count > 0) {
        var id = result.hits[0].id;
        team = repoConn.get(id);
    }

    return team;
};

/**
 * Retrieve a game by its id.
 * @param  {string} gameId Id of the game.
 * @return {Game} Game object or null if not found.
 */
exports.getGameById = function (gameId) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.GAME + "' AND _id='" + gameId + "'"
    });

    var game;
    if (result.count > 0) {
        var id = result.hits[0].id;
        game = repoConn.get(id);
    }
    if (game) {
        getGameDetails(repoConn, game);
    }

    return game;
};

/**
 * Retrieve players and teams for a game.
 * @param  {object} repoConn Repository connection.
 * @param  {Game} game Game object.
 */
var getGameDetails = function (repoConn, game) {
    game.gamePlayers = [];
    game.gameTeams = [];

    var result = repoConn.query({
        start: 0,
        count: 6,
        query: "type IN ('" + TYPE.GAME_PLAYER + "', '" + TYPE.GAME_TEAM + "') AND gameId='" + game._id + "'"
    });

    var members;
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        members = [].concat(repoConn.get(ids));
        for (var i = 0; i < members.length; i++) {
            if (members[i].type === TYPE.GAME_PLAYER) {
                game.gamePlayers.push(members[i]);
            } else if (members[i].type === TYPE.GAME_TEAM) {
                game.gameTeams.push(members[i]);
            }
        }
    }

    return game;
};

/**
 * Retrieve a list of league games.
 * @param  {string} leagueId League id.
 * @param  {number} [start=0] First index of the league games.
 * @param  {number} [count=10] Number of games to fetch.
 * @return {GamesResponse} League games.
 */
exports.getGamesByLeagueId = function (leagueId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.GAME + "' AND leagueId = '" + leagueId + "'"
    });

    var games = [];
    if (result.count > 0) {
        games = result.hits.map(function (hit) {
            return exports.getGameById(hit.id);
        });
    }

    return {
        "total": result.total,
        "count": result.count,
        "games": games
    };
};

/**
 * Retrieve the list of leagues a player is a member of.
 * @param  {string} playerId Player id.
 * @param  {number} [start=0] First index of the leagues.
 * @param  {number} [count=10] Number of leagues to fetch.
 * @return {LeagueResponse} Leagues.
 */
exports.getLeaguesByPlayerId = function (playerId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND playerId = '" + playerId + "'"
    });

    var leaguePlayers = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leaguePlayers = [].concat(repoConn.get(ids));
    }
    var leagueIds = leaguePlayers.map(function (leaguePlayer) {
        return leaguePlayer.leagueId;
    });
    var leagues = [].concat(repoConn.get(leagueIds));

    return {
        "total": result.total,
        "count": result.count,
        "leagues": leagues
    };
};

/**
 * Retrieve the list of teams a player is a member of.
 * @param  {string} playerId Player id.
 * @param  {number} [start=0] First index of the teams.
 * @param  {number} [count=10] Number of teams to fetch.
 * @return {TeamResponse} Teams.
 */
exports.getTeamsByPlayerId = function (playerId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.TEAM + "' AND playerIds = '" + playerId + "'"
    });

    var teams = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        teams = [].concat(repoConn.get(ids));
    }

    return {
        "total": result.total,
        "count": result.count,
        "teams": teams
    };
};


/**
 * Retrieve a list of games for a player.
 * @param  {string} playerId Player id.
 * @param  {number} [start=0] First index of the league games.
 * @param  {number} [count=10] Number of games to fetch.
 * @return {GamesResponse} Player games.
 */
exports.getGamesByPlayerId = function (playerId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.GAME_PLAYER + "' AND playerId = '" + playerId + "'",
        sort: "time DESC"
    });

    var gamePlayers = [];
    if (result.count > 0) {
        gamePlayers = result.hits.map(function (hit) {
            return hit.id;
        });
        gamePlayers = [].concat(repoConn.get(gamePlayers));
    }
    var gameIds = gamePlayers.map(function (gamePlayer) {
        return gamePlayer.gameId;
    });
    var games = gameIds.map(function (gameId) {
        return exports.getGameById(gameId);
    });

    return {
        "total": result.total,
        "count": result.count,
        "games": games
    };
};

/**
 * Retrieve the list of leagues a team is a member of.
 * @param  {string} teamId Team id.
 * @param  {number} [start=0] First index of the leagues.
 * @param  {number} [count=10] Number of leagues to fetch.
 * @return {LeagueResponse} Leagues.
 */
exports.getLeaguesByTeamId = function (teamId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND teamId = '" + teamId + "'"
    });

    var leagueTeams = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        leagueTeams = [].concat(repoConn.get(ids));
    }
    var leagueIds = leagueTeams.map(function (leagueTeam) {
        return leagueTeam.leagueId;
    });
    var leagues = [].concat(repoConn.get(leagueIds));

    return {
        "total": result.total,
        "count": result.count,
        "leagues": leagues
    };
};

/**
 * Retrieve a list of games for a team.
 * @param  {string} teamId Team id.
 * @param  {number} [start=0] First index of the league games.
 * @param  {number} [count=10] Number of games to fetch.
 * @return {GamesResponse} Team games.
 */
exports.getGamesByTeamId = function (teamId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.GAME_TEAM + "' AND teamId = '" + teamId + "'",
        sort: "time DESC"
    });

    var gameTeams = [];
    if (result.count > 0) {
        gameTeams = result.hits.map(function (hit) {
            return hit.id;
        });
        gameTeams = [].concat(repoConn.get(gameTeams));
    }
    var gameIds = gameTeams.map(function (gameTeam) {
        return gameTeam.gameId;
    });
    var games = gameIds.map(function (gameId) {
        return exports.getGameById(gameId);
    });

    return {
        "total": result.total,
        "count": result.count,
        "games": games
    };
};

/**
 * Retrieve the list of comments for a game.
 * @param  {string} gameId Game id.
 * @param  {number} [start=0] First index of the comments.
 * @param  {number} [count=10] Number of comments to fetch.
 * @return {CommentsResponse} Game comments.
 */
exports.getCommentsByGameId = function (gameId, start, count) {
    var repoConn = newConnection();

    start = start || 0;
    count = count || 10;
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.COMMENT + "' AND gameId='" + gameId + "'",
        sort: "_timestamp DESC"
    });

    var comments = [];
    if (result.count > 0) {
        var ids = result.hits.map(function (hit) {
            return hit.id;
        });
        comments = [].concat(repoConn.get(ids));
    }

    return {
        total: result.total,
        count: result.count,
        comments: comments
    };
};

/**
 * Create a new league.
 *
 * @param {object} params JSON with the league parameters.
 * @param {string} params.name Name of the league.
 * @param {string} params.sport Sport id (e.g. 'foos')
 * @param {string} [params.description] League description text.
 * @param {string} [params.imageStream] Stream with the league's image.
 * @param {string} [params.imageType] Mime type of the league's image.
 * @param {Object} [params.config] League config.
 * @return {string} League id.
 */
exports.createLeague = function (params) {
    var repoConn = newConnection();

    params.config = params.config || {};
    params.sport = params.sport || 'foos';
    required(params, 'name');

    var imageAttachment = null;
    if (params.imageStream && required(params, 'imageType')) {
        var ext = extensionFromMimeType(params.imageType);
        imageAttachment = newAttachment('league' + ext, params.imageStream, params.imageType)
    }

    var leagueNode = repoConn.create({
        _name: prettifyName(params.name),
        _parentPath: LEAGUES_PATH,
        type: TYPE.LEAGUE,
        name: params.name,
        sport: params.sport,
        image: imageAttachment && imageAttachment.name,
        description: params.description,
        config: params.config,
        attachment: imageAttachment
    });

    var playersNode = repoConn.create({
        _name: 'players',
        _parentPath: leagueNode._path
    });
    var teamsNode = repoConn.create({
        _name: 'teams',
        _parentPath: leagueNode._path
    });
    var gamesNode = repoConn.create({
        _name: 'games',
        _parentPath: leagueNode._path
    });

    return leagueNode;
};

/**
 * Create a new player.
 *
 * @param {object} params JSON with the player parameters.
 * @param {string} params.name Name of the player.
 * @param {string} [params.nickname] Nickname of the player.
 * @param {string} [params.imageStream] Stream with the player's image.
 * @param {string} [params.imageType] Mime type of the player's image.
 * @param {string} [params.nationality] 2 letter country code of the player (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
 * @param {string} [params.handedness='right'] Player handedness: 'right', 'left', 'ambidexterity.
 * @param {string} [params.description] Description text.
 * @return {object} Created player.
 */
exports.createPlayer = function (params) {
    var repoConn = newConnection();

    params.handedness = params.handedness || 'right';
    required(params, 'name');

    var imageAttachment = null;
    if (params.imageStream && required(params, 'imageType')) {
        var ext = extensionFromMimeType(params.imageType);
        imageAttachment = newAttachment('player' + ext, params.imageStream, params.imageType)
    }

    var playerNode = repoConn.create({
        _name: prettifyName(params.name),
        _parentPath: PLAYERS_PATH,
        type: TYPE.PLAYER,
        name: params.name,
        nickname: params.nickname,
        image: imageAttachment && imageAttachment.name,
        nationality: params.nationality,
        handedness: params.handedness,
        description: params.description,
        attachment: imageAttachment
    });

    return playerNode;
};

/**
 * Create a new team.
 *
 * @param {object} params JSON with the team parameters.
 * @param {string} params.name Name of the team.
 * @param {string} [params.imageStream] Stream with the team's image.
 * @param {string} [params.imageType] Mime type of the team's image.
 * @param {string} [params.description] Description text.
 * @param {string[]} params.playerIds Array with ids of the team players.
 * @return {string} Created team.
 */
exports.createTeam = function (params) {
    var repoConn = newConnection();

    params.handedness = params.handedness || 'right';
    required(params, 'name');
    required(params, 'playerIds');
    if (params.playerIds.length !== 2) {
        throw "Parameter 'playerIds' must have 2 values";
    }

    var imageAttachment = null;
    if (params.imageStream && required(params, 'imageType')) {
        var ext = extensionFromMimeType(params.imageType);
        imageAttachment = newAttachment('team' + ext, params.imageStream, params.imageType)
    }

    var teamNode = repoConn.create({
        _name: prettifyName(params.name),
        _parentPath: TEAMS_PATH,
        type: TYPE.TEAM,
        name: params.name,
        image: imageAttachment && imageAttachment.name,
        description: params.description,
        playerIds: params.playerIds,
        attachment: imageAttachment
    });

    return teamNode;
};

/**
 * Create a new game.
 *
 * @param {object} params JSON with the game parameters.
 * @param {string} params.leagueId League id.
 * @param {string} params.time Date and time when the game was started. An ISO-8601-formatted instant (e.g '2011-12-03T10:15:30Z').
 * @param {boolean} params.finished True if the game is completed, false if the game is still in progress.
 * @param {Point[]} [params.points] Array of points scored during the game.
 * @param {GamePlayer[]} params.gamePlayers Array with the players and its properties for this game.
 * @param {GameTeam[]} params.gameTeams Array with the teams and its properties for this game.
 * @return {object} Created game.
 */
exports.createGame = function (params) {
    var repoConn = newConnection();

    var leagueNode = repoConn.get(params.leagueId);
    if (!leagueNode) {
        throw "League not found: " + params.leagueId;
    }

    params.points = params.points || [];
    params.gameTeams = params.gameTeams || [];

    var gameNode = repoConn.create({
        _parentPath: leagueNode._path + LEAGUE_GAMES_REL_PATH,
        type: TYPE.GAME,
        leagueId: params.leagueId,
        time: valueLib.instant(params.time),
        finished: !!params.finished,
        points: params.points
    });

    var i, gamePlayer, gameTeam;
    gameNode.gamePlayers = [];
    for (i = 0; i < params.gamePlayers.length; i++) {
        gamePlayer = params.gamePlayers[i];
        var gamePlayerNode = repoConn.create({
            _parentPath: gameNode._path,
            leagueId: params.leagueId,
            type: TYPE.GAME_PLAYER,
            time: valueLib.instant(params.time),
            gameId: gameNode._id,

            playerId: gamePlayer.playerId,
            score: gamePlayer.score,
            scoreAgainst: gamePlayer.scoreAgainst,
            side: gamePlayer.side,
            winner: gamePlayer.winner,
            ratingDelta: gamePlayer.ratingDelta
        });
        gameNode.gamePlayers.push(gamePlayerNode);
    }

    gameNode.gameTeams = [];
    for (i = 0; i < params.gameTeams.length; i++) {
        gameTeam = params.gameTeams[i];
        var gameTeamNode = repoConn.create({
            _parentPath: gameNode._path,
            leagueId: params.leagueId,
            type: TYPE.GAME_TEAM,
            time: valueLib.instant(params.time),
            gameId: gameNode._id,

            teamId: gameTeam.teamId,
            score: gameTeam.score,
            scoreAgainst: gameTeam.scoreAgainst,
            side: gameTeam.side,
            winner: gameTeam.winner,
            ratingDelta: gameTeam.ratingDelta
        });
        gameNode.gameTeams.push(gameTeamNode);
    }

    return gameNode;
};

/**
 * Create a comment for a game.
 *
 * @param {object} params JSON with the comment parameters.
 * @param {string} params.text Name of the league.
 * @param {string} params.gameId Game id.
 * @param {string} params.author Player id.
 * @param {string} params.mediaStream Binary name of the league's image.
 * @param {string} params.mediaType Mime type of the league's image.
 * @return {string} Created comment.
 */
exports.createComment = function (params) {
    var repoConn = newConnection();

    required(params, 'text');
    required(params, 'gameId');

    var mediaAttachment = null;
    if (params.mediaStream && required(params, 'mediaType')) {
        var ext = extensionFromMimeType(params.mediaType);
        mediaAttachment = newAttachment('comment' + ext, params.mediaStream, params.mediaType)
    }

    var gameNode = repoConn.get(params.gameId);
    if (!gameNode || gameNode.type !== TYPE.GAME) {
        throw "Comment game not found: " + params.gameId;
    }

    if (params.author) {
        var playerNode = repoConn.get(params.author);
        if (!playerNode || playerNode.type !== TYPE.PLAYER) {
            throw "Comment author not found: " + params.author;
        }
    }

    var commentNode = repoConn.create({
        _parentPath: gameNode._path,
        type: TYPE.COMMENT,
        gameId: params.gameId,
        author: params.author,
        text: params.text,
        media: mediaAttachment && mediaAttachment.name,
        attachment: mediaAttachment
    });

    return commentNode;
};


/**
 * Add a player to an existing league.
 *
 * @param {string} leagueId Id of the league.
 * @param {string} playerId Id of the player.
 * @param {number} [rating=0] Initial player rating in the league ranking.
 * @return {LeaguePlayer} Created leaguePlayer.
 */
exports.joinPlayerLeague = function (leagueId, playerId, rating) {
    var repoConn = newConnection();
    rating = rating || ratingLib.INITIAL_RATING;

    var leagueNode = repoConn.get(leagueId);
    if (!leagueNode || leagueNode.type !== TYPE.LEAGUE) {
        throw "League not found: " + leagueId;
    }

    var playerNode = repoConn.get(playerId);
    if (!playerNode || playerNode.type !== TYPE.PLAYER) {
        throw "Player not found: " + leagueId;
    }

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND playerId='" + playerId + "' AND leagueId='" + leagueId + "'"
    });
    if (result.count > 0) {
        log.info('Player [' + playerId + '] already a member of league [' + leagueId + ']');
        return;
    }

    var leaguePlayer = repoConn.create({
        _parentPath: leagueNode._path + LEAGUE_PLAYERS_REL_PATH,
        type: TYPE.LEAGUE_PLAYER,
        playerId: playerId,
        leagueId: leagueId,
        rating: rating
    });

    return leaguePlayer;
};

/**
 * Add a team to an existing league.
 *
 * @param {string} leagueId Id of the league.
 * @param {string} teamId Id of the team.
 * @param {number} [rating=0] Initial team rating in the league ranking.
 * @return {LeagueTeam} Created leagueTeam.
 */
exports.joinTeamLeague = function (leagueId, teamId, rating) {
    var repoConn = newConnection();
    rating = rating || ratingLib.INITIAL_RATING;

    var leagueNode = repoConn.get(leagueId);
    if (!leagueNode || leagueNode.type !== TYPE.LEAGUE) {
        throw "League not found: " + leagueId;
    }

    var teamNode = repoConn.get(teamId);
    if (!teamNode || teamNode.type !== TYPE.TEAM) {
        throw "Team not found: " + leagueId;
    }

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND teamId='" + teamId + "' AND leagueId='" + leagueId + "'"
    });
    if (result.count > 0) {
        log.info('Team [' + teamId + '] already a member of league [' + leagueId + ']');
        return;
    }

    var leagueTeam = repoConn.create({
        _parentPath: leagueNode._path + LEAGUE_TEAMS_REL_PATH,
        type: TYPE.LEAGUE_TEAM,
        teamId: teamId,
        leagueId: leagueId,
        rating: rating
    });

    log.info('leagueTeam: ' + JSON.stringify(leagueTeam, null, 2));

    return leagueTeam;
};

/**
 * Modify an existing player.
 *
 * @param {object} params JSON with the player parameters.
 * @param {string} params.playerId Id of the player to update.
 * @param {string} [params.name] New name of the player.
 * @param {string} [params.nickname] New nickname of the player.
 * @param {string} [params.imageStream] New stream with the player's image.
 * @param {string} [params.imageType] New mime type of the player's image.
 * @param {string} [params.nationality] New 2 letter country code of the player.
 * @param {string} [params.handedness='right'] New player handedness: 'right', 'left', 'ambidexterity.
 * @param {string} [params.description] New description text.
 * @return {Player} Updated player or null if the player could not be updated.
 */
exports.updatePlayer = function (params) {
    var repoConn = newConnection();

    params.handedness = params.handedness || 'right';
    required(params, 'playerId');

    var imageAttachment = null;
    if (params.imageStream && required(params, 'imageType')) {
        var ext = extensionFromMimeType(params.imageType);
        imageAttachment = newAttachment('player' + ext, params.imageStream, params.imageType)
    }

    if (params.name != null) {
        var node = repoConn.get(params.playerId);
        if (!node) {
            return null;
        }
        if (node.name !== params.name) {
            var success = repoConn.move({
                source: params.playerId,
                target: prettifyName(params.name)
            });
            if (!success) {
                return null;
            }
        }
    }

    var playerNode = repoConn.modify({
        key: params.playerId,
        editor: function (node) {
            if (params.name != null) {
                node.name = params.name;
            }
            if (params.nickname != null) {
                node.nickname = params.nickname;
            }
            if (params.nationality != null) {
                node.nationality = params.nationality;
            }
            if (params.handedness != null) {
                node.handedness = params.handedness;
            }
            if (params.description != null) {
                node.description = params.description;
            }
            if (imageAttachment) {
                node.image = imageAttachment.name;
                node.attachment = imageAttachment;
            }
            return node;
        }
    });

    return playerNode;
};

/**
 * Modify an existing team.
 *
 * @param {object} params JSON with the team parameters.
 * @param {string} params.teamId Id of the team to update.
 * @param {string} [params.name] New name of the team.
 * @param {string} [params.imageStream] New stream with the team's image.
 * @param {string} [params.imageType] New mime type of the team's image.
 * @param {string} [params.description] New description text.
 * @return {Team} Updated team or null if the team could not be updated.
 */
exports.updateTeam = function (params) {
    var repoConn = newConnection();

    required(params, 'teamId');

    var imageAttachment = null;
    if (params.imageStream && required(params, 'imageType')) {
        var ext = extensionFromMimeType(params.imageType);
        imageAttachment = newAttachment('team' + ext, params.imageStream, params.imageType)
    }

    if (params.name != null) {
        var node = repoConn.get(params.teamId);
        if (!node) {
            return null;
        }
        if (node.name !== params.name) {
            var success = repoConn.move({
                source: params.teamId,
                target: prettifyName(params.name)
            });
            if (!success) {
                return null;
            }
        }
    }

    var teamNode = repoConn.modify({
        key: params.teamId,
        editor: function (node) {
            if (params.name != null) {
                node.name = params.name;
            }
            if (params.description != null) {
                node.description = params.description;
            }
            if (imageAttachment) {
                node.image = imageAttachment.name;
                node.attachment = imageAttachment;
            }
            return node;
        }
    });

    return teamNode;
};

/**
 * Modify an existing league.
 *
 * @param {object} params JSON with the league parameters.
 * @param {string} params.leagueId Id of the league to update.
 * @param {string} [params.name] New name of the league.
 * @param {string} [params.imageStream] New stream with the league's image.
 * @param {string} [params.imageType] New mime type of the league's image.
 * @param {string} [params.description] New description text.
 * @param {object} [params.config] New league config.
 * @return {League} Updated league or null if the league could not be updated.
 */
exports.updateLeague = function (params) {
    var repoConn = newConnection();

    required(params, 'leagueId');

    var imageAttachment = null;
    if (params.imageStream && required(params, 'imageType')) {
        var ext = extensionFromMimeType(params.imageType);
        imageAttachment = newAttachment('league' + ext, params.imageStream, params.imageType)
    }

    if (params.name != null) {
        var node = repoConn.get(params.leagueId);
        if (!node) {
            return null;
        }
        if (node.name !== params.name) {
            var success = repoConn.move({
                source: params.leagueId,
                target: prettifyName(params.name)
            });
            if (!success) {
                return null;
            }
        }
    }

    var leagueNode = repoConn.modify({
        key: params.leagueId,
        editor: function (node) {
            if (params.name != null) {
                node.name = params.name;
            }
            if (params.description != null) {
                node.description = params.description;
            }
            if (imageAttachment) {
                node.image = imageAttachment.name;
                node.attachment = imageAttachment;
            }
            if (params.config != null) {
                node.config = params.config;
            }
            return node;
        }
    });

    return leagueNode;
};


/**
 * Add or decrease player rating in an existing league.
 *
 * @param {string} leagueId Id of the league.
 * @param {string} playerId Id of the player.
 * @param {number} ratingDelta Increment in rating points.
 * @return {LeaguePlayer} Updated leaguePlayer.
 */
exports.updatePlayerLeagueRating = function (leagueId, playerId, ratingDelta) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND playerId='" + playerId + "' AND leagueId='" + leagueId + "'"
    });

    if (result.count === 0) {
        log.info('League player not found for playerId=[' + playerId + '] and leagueId=[' + leagueId + ']');
        return null;
    }

    var leaguePlayerNode = repoConn.modify({
        key: result.hits[0].id,
        editor: function (node) {
            node.rating = (node.rating || 0) + ratingDelta;
            return node;
        }
    });
    return leaguePlayerNode;
};

/**
 * Add or decrease team rating in an existing league.
 *
 * @param {string} leagueId Id of the league.
 * @param {string} teamId Id of the team.
 * @param {number} ratingDelta Increment in rating points.
 * @return {LeagueTeam} Updated leagueTeam.
 */
exports.updateTeamLeagueRating = function (leagueId, teamId, ratingDelta) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND teamId='" + teamId + "' AND leagueId='" + leagueId + "'"
    });

    if (result.count === 0) {
        log.info('League team not found for teamId=[' + teamId + '] and leagueId=[' + leagueId + ']');
        return null;
    }

    var leagueTeamNode = repoConn.modify({
        key: result.hits[0].id,
        editor: function (node) {
            node.rating = (node.rating || 0) + ratingDelta;
            return node;
        }
    });

    return leagueTeamNode;
};

/**
 * Update a game.
 *
 * @param {object} params JSON with the game parameters.
 * @param {string} params.gameId Game id.
 * @param {boolean} [params.finished] True if the game is completed, false if the game is still in progress.
 * @param {Point[]} [params.points] Array of points scored during the game.
 * @param {GamePlayer[]} [params.gamePlayers] Array with the players and its properties for this game.
 * @param {GameTeam[]} [params.gameTeams] Array with the teams and its properties for this game.
 */
exports.updateGame = function (params) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.GAME + "' AND gameId='" + params.gameId + "'"
    });

    if (result.count > 0) {
        repoConn.modify({
            key: result.hits[0].id,
            editor: function (node) {
                if (params.finished != null) {
                    node.finished = params.finished;
                }
                if (params.points != null) {
                    node.points = params.points;
                }
                return node;
            }
        });
    }

    params.gamePlayers = params.gamePlayers || [];
    params.gameTeams = params.gameTeams || [];

    var i, gamePlayer, gameTeam;
    // For gamePlayer, gameTeam update only: score, scoreAgainst, winner, ratingDelta
    for (i = 0; i < params.gamePlayers.length; i++) {
        gamePlayer = params.gamePlayers[i];
        var gamePlayerResult = repoConn.query({
            start: 0,
            count: 1,
            query: "type = '" + TYPE.GAME_PLAYER + "' AND gameId='" + params.gameId + "' AND playerId='" + gamePlayer.playerId + "'"
        });

        if (gamePlayerResult.count > 0) {
            (function (gp) {
                repoConn.modify({
                    key: gamePlayerResult.hits[0].id,
                    editor: function (node) {
                        if (gp.score != null) {
                            node.score = gp.score;
                        }
                        if (gp.scoreAgainst != null) {
                            node.scoreAgainst = gp.scoreAgainst;
                        }
                        if (gp.winner != null) {
                            node.winner = gp.winner;
                        }
                        if (gp.ratingDelta != null) {
                            node.ratingDelta = gp.ratingDelta;
                        }
                        return node;
                    }
                });
            })(gamePlayer);
        }
    }

    for (i = 0; i < params.gameTeams.length; i++) {
        gameTeam = params.gameTeams[i];
        var gameTeamResult = repoConn.query({
            start: 0,
            count: 1,
            query: "type = '" + TYPE.GAME_TEAM + "' AND gameId='" + params.gameId + "' AND teamId='" + gameTeam.teamId + "'"
        });

        if (gameTeamResult.count > 0) {
            (function (gt) {
                repoConn.modify({
                    key: gameTeamResult.hits[0].id,
                    editor: function (node) {
                        if (gt.score != null) {
                            node.score = gt.score;
                        }
                        if (gt.scoreAgainst != null) {
                            node.scoreAgainst = gt.scoreAgainst;
                        }
                        if (gt.winner != null) {
                            node.winner = gt.winner;
                        }
                        if (gt.ratingDelta != null) {
                            node.ratingDelta = gt.ratingDelta;
                        }
                        return node;
                    }
                });
            })(gameTeam);
        }
    }
};

/**
 * Refresh the index.
 */
exports.refresh = function () {
    var repoConn = newConnection();
    repoConn.refresh('SEARCH');
};

var newConnection = function () {
    return nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master',
        principals: ["role:system.admin"]
    });
};

/**
 * Create an attachment object.
 *
 * @param {string} attachmentName Attachment name.
 * @param {Object} attachmentBinary Binary stream.
 * @param {string} mimeType Mime type of the attachment.
 * @param {string} [label] Attachment label.
 * @return {Attachment} Attachment object.
 */
var newAttachment = function (attachmentName, attachmentBinary, mimeType, label) {
    var bin = valueLib.binary(notNull(attachmentName, 'attachmentName'), notNull(attachmentBinary, 'attachmentBinary'));
    return {
        name: attachmentName,
        binary: bin,
        mimeType: notNull(mimeType, 'mimeType'),
        label: label,
        size: attachmentBinary.size()
    };
};

var required = function (params, name) {
    var value = params[name];
    if (value === undefined) {
        throw "Parameter '" + name + "' is required";
    }

    return value;
};

var notNull = function (value, paramName) {
    if (notNull == null) {
        throw "Parameter '" + paramName + "' is required";
    }
    return value;
};

var prettifyName = function (str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
        var c = str[i];
        var isNumber = c >= '0' && c <= '9';
        if (isNumber) {
            result += c;
            continue;
        }
        var isLetter = c.toUpperCase() !== c.toLowerCase();
        if (isLetter) {
            result += c.toLowerCase();
        } else if ('_-'.indexOf(c) > -1) {
            result += c;
        } else if (result && result.slice(-1) !== '-') {
            result += '-';
        }
    }
    if (result && result.slice(-1) === '-') {
        result = result.slice(0, -1);
    }
    return result;
};

var extensionFromMimeType = function (mimeType) {
    var ext = '';
    if (mimeType.indexOf('image/png') > -1) {
        ext = '.png';
    } else if (mimeType.indexOf('image/jpg') > -1 || mimeType.indexOf('image/jpeg') > -1) {
        ext = '.jpg';
    } else if (mimeType.indexOf('image/gif') > -1) {
        ext = '.gif';
    }
    return ext;
};
