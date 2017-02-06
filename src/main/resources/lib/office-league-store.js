var nodeLib = require('/lib/xp/node');
var valueLib = require('/lib/xp/value');

var REPO_NAME = 'office-league';

var TYPE = {
    PLAYER: 'player',
    TEAM: 'team',
    GAME: 'game',
    GAME_PLAYER: 'gamePlayer',
    GAME_TEAM: 'gameTeam',
    LEAGUE: 'league',
    LEAGUE_PLAYER: 'leaguePlayer',
    LEAGUE_TEAM: 'leagueTeam'
};

/**
 * @typedef {Object} League
 * @property {string} type Object type: 'league'
 * @property {string} name Name of the league.
 * @property {string} sport Sport id (e.g. 'foos')
 * @property {string} description League description text.
 * @property {Object} config League config.
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
 * @property {string} image Binary name of the player's image.
 * @property {string} nationality 2 letter country code of the player (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
 * @property {string} handedness Player handedness: 'right', 'left', 'ambidexterity.
 * @property {string} description Description text.
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
 * @property {string} image Binary name of the team's image.
 * @property {string} description Description text.
 * @property {string[]} playerIds Array with ids of the team players.
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
exports.getLeaguePlayers = function (leagueId, start, count) {
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

var newConnection = function () {
    return nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master',
        principals: ["role:system.admin"]
    });
};