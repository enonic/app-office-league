var nodeLib = require('/lib/xp/node');
var valueLib = require('/lib/xp/value');
var ratingLib = require('/lib/office-league-rating');
var eventLib = require('/lib/xp/event');
var randomLib = require('/lib/random-names');
var imageLib = require('/lib/image');

var REPO_NAME = 'office-league';
var LEAGUES_PATH = '/leagues';
var PLAYERS_PATH = '/players';
var TEAMS_PATH = '/teams';
var LEAGUE_GAMES_REL_PATH = '/games';
var LEAGUE_PLAYERS_REL_PATH = '/players';
var LEAGUE_TEAMS_REL_PATH = '/teams';
var OFFICE_LEAGUE_GAME_EVENT_ID = 'office-league-game';

var NAME_MAX_LENGTH = 30;
var NAME_MIN_LENGTH = 3;
var INVALID_NAME_CHARS = {
    '$': true,
    '&': true,
    '|': true,
    ':': true,
    ';': true,
    '#': true,
    '/': true,
    '\\': true,
    '<': true,
    '>': true,
    '\"': true,
    '*': true,
    '+': true,
    ',': true,
    '=': true,
    '@': true,
    '%': true,
    '{': true,
    '}': true,
    '[': true,
    ']': true,
    '`': true,
    '~': true,
    '^': true,
    // '_': true,
    '\'': true,
    '?': true
};

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

var ROOT_PERMISSIONS = [ //TODO Remove after XP issue 4801 resolution
    {
        "principal": "role:system.authenticated",
        "allow": [
            "READ",
            "CREATE",
            "MODIFY",
            "DELETE",
            "PUBLISH",
            "READ_PERMISSIONS",
            "WRITE_PERMISSIONS"
        ],
        "deny": []
    },
    {
        "principal": "role:system.everyone",
        "allow": ["READ"],
        "deny": []
    }
];

exports.REPO_NAME = REPO_NAME;

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
 * @property {string} type Object type: 'league'
 * @property {string} name Name of the league.
 * @property {string} sport Sport id (e.g. 'foos')
 * @property {string} description League description text.
 * @property {string} image Attachment name of the league's image.
 * @property {string} imageUrl URL for the league's image.
 * @property {Object} config League config.
 * @property {string[]} adminPlayerIds Array with ids of the admin players.
 * @property {Attachment|Attachment[]} [attachment] League attachments.
 */

/**
 * @typedef {Object} LeagueResponse
 * @property {League[]} hits Array of league objects.
 * @property {number} count Total number of leagues.
 * @property {number} total Count of leagues returned.
 */

/**
 * @typedef {Object} Player
 * @property {string} type Object type: 'player'
 * @property {string} userKey User key associated to the player.
 * @property {string} name Name of the player.
 * @property {string} fullname Full name of the player.
 * @property {string} image Attachment name of the player's image.
 * @property {string} imageUrl URL for the player's image.
 * @property {string} nationality 2 letter country code of the player (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
 * @property {string} handedness Player handedness: 'right', 'left', 'ambidexterity.
 * @property {string} description Description text.
 * @property {Attachment|Attachment[]} [attachment] Player attachments.
 */

/**
 * @typedef {Object} PlayerResponse
 * @property {Player[]} hits Array of player objects.
 * @property {number} count Total number of players.
 * @property {number} total Count of players returned.
 */

/**
 * @typedef {Object} Team
 * @property {string} type Object type: 'team'
 * @property {string} name Name of the team.
 * @property {string} image Attachment name of the team's image.
 * @property {string} imageUrl URL for the team's image.
 * @property {string} description Description text.
 * @property {string[]} playerIds Array with ids of the team players.
 * @property {Attachment|Attachment[]} [attachment] Team attachments.
 */

/**
 * @typedef {Object} TeamResponse
 * @property {Team[]} hits Array of team objects.
 * @property {number} count Total number of teams.
 * @property {number} total Count of teams returned.
 */

/**
 * @typedef {Object} LeaguePlayer
 * @property {string} type Object type: 'leaguePlayer'
 * @property {string} playerId Player id.
 * @property {string} leagueId League id.
 * @property {number} rating Ranking rating for the player in this league.
 * @property {boolean} inactive True if the player is inactive in this league.
 */

/**
 * @typedef {Object} LeaguePlayerResponse
 * @property {LeaguePlayer[]} hits Array of league player objects.
 * @property {number} count Total number of players in the league.
 * @property {number} total Count of players returned.
 */

/**
 * @typedef {Object} LeagueTeam
 * @property {string} type Object type: 'leagueTeam'
 * @property {string} teamId Team id.
 * @property {string} leagueId League id.
 * @property {number} rating Ranking rating for the team in this league.
 * @property {boolean} inactive True if the team is inactive in this league.
 */

/**
 * @typedef {Object} LeagueTeamResponse
 * @property {LeagueTeam[]} hits Array of league team objects.
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
 * @property {Game[]} hits Array of game objects.
 * @property {number} count Total number of games.
 * @property {number} total Count of games returned.
 */

/**
 * @typedef {Object} GameTeamsResponse
 * @property {GameTeam[]} hits Array of GameTeam objects.
 * @property {number} count Total number of games.
 * @property {number} total Count of games returned.
 */

/**
 * @typedef {Object} GamePlayersResponse
 * @property {GamePlayer[]} hits Array of GamePlayer objects.
 * @property {number} count Total number of games.
 * @property {number} total Count of games returned.
 */

/**
 * @typedef {Object} Comment
 * @property {string} type Object type: 'comment'
 * @property {string} text Comment text.
 * @property {string} gameId Game id.
 * @property {string} author Player id.
 * @property {string} time Date and time of the comment. An ISO-8601-formatted instant (e.g '2011-12-03T10:15:30Z').
 * @property {string} media Binary name of the league's image.
 * @property {string} mediaType Mime type of the league's image.
 */

/**
 * @typedef {Object} CommentsResponse
 * @property {Comment[]} hits Array of game comment objects.
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
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE + "'"
    });
};

/**
 * Retrieve a league by its id.
 * @param  {string} leagueId Id of the league.
 * @return {League} League object or null if not found.
 */
exports.getLeagueById = function (leagueId) {
    var repoConn = newConnection();

    var obj = repoConn.get(leagueId);
    return obj && (obj.type === TYPE.LEAGUE) ? setImageUrl(obj) : null;
};

/**
 * Retrieve multiple leagues by their ids.
 * @param  {string[]} leagueIds Ids of the leagues.
 * @return {League[]} Array of League objects found.
 */
exports.getLeaguesById = function (leagueIds) {
    var repoConn = newConnection();

    var obj = repoConn.get(leagueIds);
    return obj && [].concat(obj).filter(function (obj) {
            setImageUrl(obj);
            return obj.type === TYPE.LEAGUE;
        });
};

/**
 * Retrieve a league by its name.
 * @param  {string} name Name of the league.
 * @return {League} League object or null if not found.
 */
exports.getLeagueByName = function (name) {
    return querySingleHit({
        query: "type = '" + TYPE.LEAGUE + "' AND name='" + name + "'"
    });
};

/**
 * Retrieve a list of league players and their rating points in the ranking.
 * @param  {string} leagueId League id.
 * @param  {number} [start=0] First index of the players.
 * @param  {number} [count=10] Number of players to fetch.
 * @return {LeaguePlayerResponse} League players.
 */
exports.getLeaguePlayersByLeagueId = function (leagueId, start, count, sort) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND leagueId='" + leagueId + "' AND (inactive != 'true')",
        sort: sort || "rating DESC, name ASC"
    });
};

/**
 * Retrieve a list of league players and their rating points in the ranking.
 * @param  {string} playerId Player id.
 * @param  {number} [start=0] First index of the players.
 * @param  {number} [count=10] Number of players to fetch.
 * @return {LeaguePlayerResponse} League players.
 */
exports.getLeaguePlayersByPlayerId = function (playerId, start, count, sort) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND playerId='" + playerId + "' AND (inactive != 'true')",
        sort: sort || "rating DESC, name ASC"
    });
};

/**
 * Retrieve a LeaguePlayer
 * @param  {string} leagueId League id.
 * @param  {string} playerId Player id.
 * @return {LeaguePlayer} League player.
 */
exports.getLeaguePlayerByLeagueIdAndPlayerId = function (leagueId, playerId) {
    return querySingleHit({
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND leagueId='" + leagueId + "' AND playerId='" + playerId +
               "' AND (inactive != 'true')"
    });
};

/**
 * Retrieve a LeagueTeam
 * @param  {string} leagueId League id.
 * @param  {string} teamId Team id.
 * @return {LeagueTeam} League team.
 */
exports.getLeagueTeamByLeagueIdAndTeamId = function (leagueId, teamId) {
    return querySingleHit({
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND leagueId='" + leagueId + "' AND teamId='" + teamId + "'"
    });
};

/**
 * Retrieve a list of league players and their rating points in the ranking.
 * @param  {string} leagueId League id.
 * @param  {string[]} playerIds Player ids.
 * @return {LeaguePlayerResponse} League players.
 */
exports.getLeaguePlayersByLeagueIdAndPlayerIds = function (leagueId, playerIds) {
    playerIds = playerIds || [];
    if (playerIds.length === 0) {
        return {
            total: 0,
            start: 0,
            count: 0,
            hits: []
        };
    }
    var playersCondition = playerIds.map(function (id) {
        return "playerId='" + id + "'";
    }).join(' OR ');

    return query({
        start: 0,
        count: playerIds.length,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND (" + playersCondition + ")"
    });
};

/**
 * Retrieve a list of league teams and their rating points in the ranking.
 * @param  {string} leagueId League id.
 * @param  {string[]} teamIds Team ids.
 * @return {LeagueTeamResponse} League teams.
 */
exports.getLeagueTeamsByLeagueIdAndTeamIds = function (leagueId, teamIds) {

    teamIds = teamIds || [];
    if (teamIds.length === 0) {
        return {
            total: 0,
            start: 0,
            count: 0,
            hits: []
        };
    }

    var teamsCondition = teamIds.map(function (id) {
        return "teamId='" + id + "'";
    }).join(' OR ');

    return query({
        start: 0,
        count: teamIds.length,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND (" + teamsCondition + ")"
    });
};

/**
 * Retrieve a list of league teams and their rating points in the ranking.
 * @param  {string} leagueId League id.
 * @param  {number} [start=0] First index of the teams.
 * @param  {number} [count=10] Number of teams to fetch.
 * @return {LeagueTeamResponse} League teams.
 */
exports.getLeagueTeamsByLeagueId = function (leagueId, start, count, sort) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND leagueId='" + leagueId + "' AND (inactive != 'true')",
        sort: sort || "rating DESC, name ASC"
    });
};

/**
 * Retrieve a list of league teams and their rating points in the ranking.
 * @param  {string} teamId Team id.
 * @param  {number} [start=0] First index of the teams.
 * @param  {number} [count=10] Number of teams to fetch.
 * @return {LeagueTeamResponse} League teams.
 */
exports.getLeagueTeamsByTeamId = function (teamId, start, count, sort) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND teamId='" + teamId + "' AND (inactive != 'true')",
        sort: sort || "rating DESC, name ASC"
    });
};

/**
 * Retrieve a list of players.
 * @param  {number} [start=0] First index of the players.
 * @param  {number} [count=10] Number of players to fetch.
 * @return {PlayerResponse} Players.
 */
exports.getPlayers = function (start, count) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.PLAYER + "'"
    });
};

/**
 * Retrieve a list of players not member of a league.
 * @param  {number} leagueId League id.
 * @param  {number} [start=0] First index of the players.
 * @param  {number} [count=10] Number of players to fetch.
 * @return {PlayerResponse} Players.
 */
exports.getPlayersByNotLeagueId = function (leagueId, start, count, sort) {
    var repoConn = newConnection();
    var leaguePlayers = repoConn.query({
        count: -1,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND leagueId='" + leagueId + "' AND (inactive != 'true')"
    });

    var memberPlayerIds = [];
    if (leaguePlayers.count > 0) {
        memberPlayerIds = leaguePlayers.hits.map(function (leaguePlayer) {
            return repoConn.get(leaguePlayer.id).playerId;
        });
    }
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.PLAYER + "' AND _id NOT IN " + toQueryList(memberPlayerIds),
        sort: sort
    });
};

function toQueryList(list) {
    if (!list) {
        return '()';
    }
    return "('" + list.join("','") + "')";
}

/**
 * Search for players.
 * @param  {string} searchText Text search.
 * @param  {number} [start=0] First index of the players.
 * @param  {number} [count=10] Number of players to fetch.
 * @return {PlayerResponse} Players.
 */
exports.findPlayers = function (searchText, start, count) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.PLAYER + "' AND ngram('name^5,description^3', '" + searchText + "', 'AND')"
    });
};

/**
 * Search for teams.
 * @param  {string} searchText Text search.
 * @param  {number} [start=0] First index of the teams.
 * @param  {number} [count=10] Number of teams to fetch.
 * @return {TeamResponse} Teams.
 */
exports.findTeams = function (searchText, start, count) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.TEAM + "' AND ngram('name^5,description^3', '" + searchText + "', 'AND')"
    });
};

/**
 * Search for leagues.
 * @param  {string} searchText Text search.
 * @param  {number} [start=0] First index of the leagues.
 * @param  {number} [count=10] Number of leagues to fetch.
 * @return {LeagueResponse} Leagues.
 */
exports.findLeagues = function (searchText, start, count) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE + "' AND ngram('name^5,description^3', '" + searchText + "', 'AND')"
    });
};

/**
 * Retrieve a player by its id.
 * @param  {string} playerId Id of the player.
 * @return {Player} Player object or null if not found.
 */
exports.getPlayerById = function (playerId) {
    var repoConn = newConnection();

    var obj = repoConn.get(playerId);
    return obj && (obj.type === TYPE.PLAYER) ? setImageUrl(obj) : null;
};

/**
 * Retrieve multiple players by their ids.
 * @param  {string[]} playerIds Ids of the players.
 * @return {Player[]} Array of Player objects found.
 */
exports.getPlayersById = function (playerIds) {
    var repoConn = newConnection();

    var obj = repoConn.get(playerIds);
    return obj && [].concat(obj).filter(function (obj) {
            setImageUrl(obj);
            return obj.type === TYPE.PLAYER;
        });
};

/**
 * Retrieve a player by its name.
 * @param  {string} name Name of the player.
 * @return {Player} Player object or null if not found.
 */
exports.getPlayerByName = function (name) {
    return querySingleHit({
        query: "type = '" + TYPE.PLAYER + "' AND name='" + name + "'"
    });
};

/**
 * Retrieve a player by its user key.
 * @param  {string} userKey User key associated to the player.
 * @return {Player} Player object or null if not found.
 */
exports.getPlayerByUserKey = function (userKey) {
    return querySingleHit({
        query: "type = '" + TYPE.PLAYER + "' AND userKey='" + userKey + "'"
    });
};

/**
 * Retrieve a list of teams.
 * @param  {number} [start=0] First index of the teams.
 * @param  {number} [count=10] Number of teams to fetch.
 * @return {TeamResponse} Teams.
 */
exports.getTeams = function (start, count) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.TEAM + "'"
    });
};

/**
 * Retrieve a team by its id.
 * @param  {string} teamId Id of the team.
 * @return {Team} Team object or null if not found.
 */
exports.getTeamById = function (teamId) {
    var repoConn = newConnection();

    var obj = repoConn.get(teamId);
    return obj && (obj.type === TYPE.TEAM) ? setImageUrl(obj) : null;
};

/**
 * Retrieve multiple teams by their ids.
 * @param  {string[]} teamIds Ids of the teams.
 * @return {Team[]} Array of Team objects found.
 */
exports.getTeamsById = function (teamIds) {
    var repoConn = newConnection();

    var obj = repoConn.get(teamIds);
    return obj && [].concat(obj).filter(function (obj) {
            setImageUrl(obj);
            return obj.type === TYPE.TEAM;
        });
};

/**
 * Retrieve a team by its players.
 * @param  {string} playerId1 Id of the 1st player in the team.
 * @param  {string} playerId2 Id of the 2nd player in the team.
 * @return {Team} Team object or null if not found.
 */
exports.getTeamByPlayerIds = function (playerId1, playerId2) {
    return querySingleHit({
        query: "type = '" + TYPE.TEAM + "' AND playerIds='" + playerId1 + "' AND playerIds='" + playerId2 + "'"
    });
};

/**
 * Retrieve a team by its name.
 * @param  {string} name Name of the team.
 * @return {Team} Team object or null if not found.
 */
exports.getTeamByName = function (name) {
    return querySingleHit({
        query: "type = '" + TYPE.TEAM + "' AND name='" + name + "'"
    });
};

/**
 * Retrieve a game by its id.
 * @param  {string} gameId Id of the game.
 * @return {Game} Game object or null if not found.
 */
exports.getGameById = function (gameId) {
    var game = querySingleHit({
        query: "type = '" + TYPE.GAME + "' AND _id='" + gameId + "'"
    });

    if (game) {
        getGameDetails(newConnection(), game);
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
 * @param  {boolean} [finished] Filter for games finished.
 * @return {GamesResponse} League games.
 */
exports.getGamesByLeagueId = function (leagueId, start, count, finished) {
    var repoConn = newConnection();

    var finishedCondition = '';
    if (finished != null) {
        finishedCondition = ' AND finished = "' + boolToStr(finished) + '"';
    }
    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.GAME + "' AND leagueId = '" + leagueId + "'" + finishedCondition,
        sort: "time DESC"
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
        "hits": games
    };
};

/**
 * Retrieve a list of league games currently being played.
 * @param  {string} leagueId League id.
 * @param  {number} [start=0] First index of the league games.
 * @param  {number} [count=10] Number of games to fetch.
 * @return {GamesResponse} League games.
 */
exports.getActiveGamesByLeagueId = function (leagueId, start, count) {
    var repoConn = newConnection();

    var now = new Date();
    var lastModifiedPlaying = now;
    var finishedRecently = now;
    var startedWithinOneDayAgo = now;

    lastModifiedPlaying.setSeconds(lastModifiedPlaying.getSeconds() - (60 * 30)); // 30 minutes ago
    finishedRecently.setSeconds(finishedRecently.getSeconds() - (60 * 10)); // 10 minutes ago
    startedWithinOneDayAgo.setSeconds(startedWithinOneDayAgo.getSeconds() - (60 * 60 * 24)); // 24h ago

    var query = "type = '" + TYPE.GAME + "' AND leagueId = '" + leagueId + "' " +
                "AND (" +
                "(finished = 'false' AND _timestamp >= instant('" + lastModifiedPlaying.toISOString() + "')) " +
                "OR ((time >= instant('" + startedWithinOneDayAgo.toISOString() + "')) "
                + "AND (_timestamp >= instant('" + finishedRecently.toISOString() + "')) )" +
                ")";


    var result = repoConn.query({
        start: start,
        count: count,
        query: query,
        sort: "finished, time DESC"
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
        "hits": games
    };
};

/**
 * Retrieve the list of games that are not finished.
 * @param  {number} [start=0] First index of the games.
 * @param  {number} [count=10] Number of games to fetch.
 * @return {GamesResponse} Games.
 */
exports.getUnfinishedGames = function (start, count) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.GAME + "' AND finished = 'false'",
        sort: "time ASC"
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
        "hits": games
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

    var result = repoConn.query({
        start: start,
        count: count,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND playerId = '" + playerId + "' AND (inactive != 'true')"
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
    var leagues = [].concat(repoConn.get(leagueIds)).map(function (league) {
        return setImageUrl(league);
    });

    return {
        "total": result.total,
        "count": result.count,
        "hits": leagues
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
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.TEAM + "' AND playerIds = '" + playerId + "'"
    });
};


/**
 * Retrieve a list of games for a player.
 * @param  {string} playerId Player id.
 * @param  {number} [start=0] First index of the league games.
 * @param  {number} [count=10] Number of games to fetch.
 * @return {GamePlayersResponse} Player games.
 */
exports.getGamePlayersByPlayerId = function (playerId, start, count) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.GAME_PLAYER + "' AND playerId = '" + playerId + "'",
        sort: "time DESC"
    });
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
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND teamId = '" + teamId + "' AND (inactive != 'true')"
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
    var leagues = [].concat(repoConn.get(leagueIds)).map(function (league) {
        return setImageUrl(league);
    });

    return {
        "total": result.total,
        "count": result.count,
        "hits": leagues
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
        "hits": games
    };
};

/**
 * Retrieve a list of games for a player.
 * @param  {string} playerId Player id.
 * @param  {number} [start=0] First index of the league games.
 * @param  {number} [count=10] Number of games to fetch.
 * @return {GamesResponse} Team games.
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
        "hits": games
    };
};

/**
 * Retrieve a list of games for a team.
 * @param  {string} teamId Team id.
 * @param  {number} [start=0] First index of the league games.
 * @param  {number} [count=10] Number of games to fetch.
 * @return {GameTeamsResponse} Team games.
 */
exports.getGameTeamsByTeamId = function (teamId, start, count) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.GAME_TEAM + "' AND teamId = '" + teamId + "'",
        sort: "time DESC"
    });
};

/**
 * Retrieve the list of comments for a game.
 * @param  {string} gameId Game id.
 * @param  {number} [start=0] First index of the comments.
 * @param  {number} [count=10] Number of comments to fetch.
 * @return {CommentsResponse} Game comments.
 */
exports.getCommentsByGameId = function (gameId, start, count) {
    return query({
        start: start,
        count: count,
        query: "type = '" + TYPE.COMMENT + "' AND gameId='" + gameId + "'",
        sort: "_timestamp DESC"
    });
};

/**
 * Get the ranking position for a player in a league.
 * @param  {string} playerId Player id.
 * @param  {string} leagueId League id.
 * @return {number} Ranking position.
 */
exports.getRankingForPlayerLeague = function (playerId, leagueId) {
    var result = query({
        start: 0,
        count: -1,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND leagueId='" + leagueId + "' AND (inactive != 'true')",
        sort: "rating DESC"
    });

    if (result.count === 0) {
        return -1;
    }

    var ranking = 0, prevRating = 0;
    for (var i = 0; i < result.hits.length; i++) {
        if (prevRating != result.hits[i].rating) {
            ranking++;
        }
        if (result.hits[i].playerId === playerId) {
            return ranking;
        }
        prevRating = result.hits[i].rating;
    }

    return -1;
};

/**
 * Get the ranking position for a team in a league.
 * @param  {string} teamId Team id.
 * @param  {string} leagueId League id.
 * @return {number} Ranking position.
 */
exports.getRankingForTeamLeague = function (teamId, leagueId) {
    var result = query({
        start: 0,
        count: -1,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND leagueId='" + leagueId + "' AND (inactive != 'true')",
        sort: "rating DESC"
    });

    if (result.count === 0) {
        return -1;
    }

    var ranking = 0, prevRating = 0;
    for (var i = 0; i < result.hits.length; i++) {
        if (prevRating != result.hits[i].rating) {
            ranking++;
        }
        if (result.hits[i].teamId === teamId) {
            return ranking;
        }
        prevRating = result.hits[i].rating;
    }

    return -1;
};

/**
 * Get the number of games in a league.
 * @param  {string} leagueId League id.
 * @return {number} Total number of games.
 */
exports.getGameCountByLeagueId = function (leagueId) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: "type = '" + TYPE.GAME + "' AND leagueId='" + leagueId + "' AND finished = 'true'"
    });
    return queryResult.total;
};

/**
 * Get the number of players in a league.
 * @param  {string} leagueId League id.
 * @return {number} Total number of players.
 */
exports.getPlayerCountByLeagueId = function (leagueId) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND leagueId='" + leagueId + "' AND (inactive != 'true')"
    });
    return queryResult.total;
};

/**
 * Get the number of teams in a league.
 * @param  {string} leagueId League id.
 * @return {number} Total number of teams.
 */
exports.getTeamCountByLeagueId = function (leagueId) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND leagueId='" + leagueId + "' AND (inactive != 'true')"
    });
    return queryResult.total;
};

/**
 * Get the number of games of a player.
 * @param  {string} playerId Player id.
 * @return {number} Total number of games.
 */
exports.getGameCountByPlayerId = function (playerId) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: "type = '" + TYPE.GAME_PLAYER + "' AND playerId='" + playerId + "'"
    });
    return queryResult.total;
};

/**
 * Get the number of won games of a player.
 * @param  {string} playerId Player id.
 * @return {number} Total number of won games.
 */
exports.getWinningGameCountByPlayerId = function (playerId) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: "type = '" + TYPE.GAME_PLAYER + "' AND playerId='" + playerId + "' AND winner = 'true'"
    });
    return queryResult.total;
};

/**
 * Get the number of goals scored by a player.
 * @param  {string} playerId Player id.
 * @return {number} Total number of goals.
 */
exports.getGoalCountByPlayerId = function (playerId) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: "type = '" + TYPE.GAME_PLAYER + "' AND playerId='" + playerId + "'",
        aggregations: {
            goalStats: {
                stats: {
                    "field": "score"
                }
            }
        }
    });
    return queryResult.aggregations && queryResult.aggregations.goalStats ? queryResult.aggregations.goalStats.sum : 0;
};

/**
 * Get the number of games of a team.
 * @param  {string} teamId Team id.
 * @return {number} Total number of games.
 */
exports.getGameCountByTeamId = function (teamId) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: "type = '" + TYPE.GAME_TEAM + "' AND teamId='" + teamId + "'"
    });
    return queryResult.total;
};

/**
 * Get the number of won games of a team.
 * @param  {string} teamId Team id.
 * @return {number} Total number of won games.
 */
exports.getWinningGameCountByTeamId = function (teamId) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: "type = '" + TYPE.GAME_TEAM + "' AND teamId='" + teamId + "' AND winner = 'true'"
    });
    return queryResult.total;
};

/**
 * Get the number of goals scored by a team.
 * @param  {string} teamId Team id.
 * @return {number} Total number of goals.
 */
exports.getGoalCountByTeamId = function (teamId) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: "type = '" + TYPE.GAME_TEAM + "' AND teamId='" + teamId + "'",
        aggregations: {
            goalStats: {
                stats: {
                    "field": "score"
                }
            }
        }
    });
    return queryResult.aggregations && queryResult.aggregations.goalStats ? queryResult.aggregations.goalStats.sum : 0;
};

function query(params) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: params.start,
        count: params.count,
        query: params.query,
        sort: params.sort
    });

    var hits = [];
    if (queryResult.count > 0) {
        var ids = queryResult.hits.map(function (hit) {
            return hit.id;
        });
        hits = [].concat(repoConn.get(ids)).map(function (hit) {
            return setImageUrl(hit);
        })
    }

    return {
        total: queryResult.total,
        start: params.start || 0,
        count: queryResult.count,
        hits: hits
    };
}

function querySingleHit(params) {
    var repoConn = newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 1,
        query: params.query
    });

    if (queryResult.count > 0) {
        var id = queryResult.hits[0].id;
        return setImageUrl(repoConn.get(id));
    }

    return null;
}

/**
 * Check if the query finds any match.
 * @param  {string} query Node query.
 * @param  {Object} [repoConn] RepoConnection object.
 * @return {boolean} True if the query found any items.
 */
function queryExists(query, repoConn) {
    repoConn = repoConn || newConnection();
    var queryResult = repoConn.query({
        start: 0,
        count: 0,
        query: query
    });
    return queryResult.total > 0;
}

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
 * @param {string[]} [params.adminPlayerIds] Array with ids of the admin players.
 * @return {string} League id.
 */
exports.createLeague = function (params) {
    var repoConn = newConnection();

    params.config = params.config || {};
    params.sport = params.sport || 'foos';
    required(params, 'name');
    params.name = validateName(params.name);

    var imageAttachment = null;
    if (params.imageStream && required(params, 'imageType')) {
        var ext = extensionFromMimeType(params.imageType);
        imageAttachment = newAttachment('league' + ext, params.imageStream, params.imageType)
    }

    var leagueNode = repoConn.create({
        _name: prettifyName(params.name),
        _parentPath: LEAGUES_PATH,
        _permissions: ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
        type: TYPE.LEAGUE,
        name: params.name,
        sport: params.sport,
        image: imageAttachment && imageAttachment.name,
        description: params.description,
        config: params.config,
        adminPlayerIds: params.adminPlayerIds || [],
        attachment: imageAttachment
    });

    var playersNode = repoConn.create({
        _name: 'players',
        _parentPath: leagueNode._path,
        _permissions: ROOT_PERMISSIONS //TODO Remove after XP issue 4801 resolution
    });
    var teamsNode = repoConn.create({
        _name: 'teams',
        _parentPath: leagueNode._path,
        _permissions: ROOT_PERMISSIONS //TODO Remove after XP issue 4801 resolution
    });
    var gamesNode = repoConn.create({
        _name: 'games',
        _parentPath: leagueNode._path,
        _permissions: ROOT_PERMISSIONS //TODO Remove after XP issue 4801 resolution
    });

    return setImageUrl(leagueNode);
};

/**
 * Create a new player.
 *
 * @param {object} params JSON with the player parameters.
 * @param {string} params.userKey User key associated to the player.
 * @param {string} params.name Name of the player.
 * @param {string} [params.fullname] Full name of the player.
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
    params.name = validateName(params.name);

    var imageAttachment = null;
    if (params.imageStream && required(params, 'imageType')) {
        var ext = extensionFromMimeType(params.imageType);
        imageAttachment = newAttachment('player' + ext, params.imageStream, params.imageType)
    }

    var playerNode = repoConn.create({
        _name: prettifyName(params.name),
        _parentPath: PLAYERS_PATH,
        _permissions: ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
        type: TYPE.PLAYER,
        userKey: params.userKey,
        name: params.name,
        fullname: params.fullname,
        image: imageAttachment && imageAttachment.name,
        nationality: params.nationality,
        handedness: params.handedness,
        description: params.description,
        attachment: imageAttachment
    });

    return setImageUrl(playerNode);
};

/**
 * Create a new team.
 *
 * @param {object} params JSON with the team parameters.
 * @param {string} [params.name] Name of the team.
 * @param {string} [params.imageStream] Stream with the team's image.
 * @param {string} [params.imageType] Mime type of the team's image.
 * @param {string} [params.description] Description text.
 * @param {string[]} params.playerIds Array with ids of the team players.
 * @return {Team} Created team.
 */
exports.createTeam = function (params) {
    var repoConn = newConnection();

    required(params, 'playerIds');
    if (params.playerIds.length !== 2) {
        throw "Parameter 'playerIds' must have 2 values";
    }

    var existingTeam = exports.getTeamByPlayerIds(params.playerIds[0], params.playerIds[1]);
    if (existingTeam) {
        return exports.updateTeam({
            teamId: existingTeam._id,
            description: params.description,
            name: params.name,
            imageStream: params.imageStream,
            imageType: params.imageType
        });
    }

    params.handedness = params.handedness || 'right';
    var name = params.name;
    while (!name || teamWithNameExists(repoConn, name)) {
        name = randomLib.randomName();
    }
    name = validateName(name);

    var imageAttachment = null;
    if (params.imageStream && required(params, 'imageType')) {
        var ext = extensionFromMimeType(params.imageType);
        imageAttachment = newAttachment('team' + ext, params.imageStream, params.imageType)
    }

    var teamNode = repoConn.create({
        _name: prettifyName(name),
        _parentPath: TEAMS_PATH,
        _permissions: ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
        type: TYPE.TEAM,
        name: name,
        image: imageAttachment && imageAttachment.name,
        description: params.description,
        playerIds: params.playerIds,
        attachment: imageAttachment
    });

    return setImageUrl(teamNode);
};

var teamWithNameExists = function (repoConn, teamName) {
    var query = "type = '" + TYPE.TEAM + "' AND name='" + teamName + "'";
    return queryExists(query, repoConn)
};

/**
 * Creates a default team from 2 existing players.
 *
 * @param {string} playerId1 Player 1.
 * @param {string} playerId2 Player 2.
 * @return {Team} Created Team object.
 */
var createDefaultTeamForPlayers = function (playerId1, playerId2) {
    var p1 = exports.getPlayerById(playerId1);
    var p2 = exports.getPlayerById(playerId2);
    var team = exports.createTeam({
        description: p1.name + ' & ' + p2.name,
        playerIds: [playerId1, playerId2]
    });

    return team;
};

/**
 * Generates a new game creation params based on the minimal properties needed.
 *
 * @param {object} params JSON with the game parameters.
 * @param {string} params.leagueId League id.
 * @param {Point[]} [params.points] Array of points scored during the game.
 * @param {GamePlayer[]} params.gamePlayers Array with the players and its properties for this game.
 * @return {object} Create game object.
 */
exports.generateCreateGameParams = function (params) {
    params.points = params.points || [];

    var singlesGame = params.gamePlayers.length === 2;
    var time = new Date().toISOString();
    var blueScore = 0, redScore = 0;
    var playerData = {};
    var blueTeamPlayerIds = [], redTeamPlayerIds = [];

    // init gamePlayer objects
    var p, gamePlayer;
    for (p = 0; p < params.gamePlayers.length; p++) {
        gamePlayer = params.gamePlayers[p];
        playerData[gamePlayer.playerId] = {
            score: 0,
            scoreAgainst: 0,
            side: gamePlayer.side,
            playerId: gamePlayer.playerId,
            winner: false,
            ratingDelta: 0
        };
        if (gamePlayer.side === 'red') {
            redTeamPlayerIds.push(gamePlayer.playerId);
        } else {
            blueTeamPlayerIds.push(gamePlayer.playerId);
        }
    }

    // init gameTeam objects
    var teams = {}, redTeam, blueTeam;
    if (!singlesGame) {
        redTeam = exports.getTeamByPlayerIds(redTeamPlayerIds[0], redTeamPlayerIds[1]);
        blueTeam = exports.getTeamByPlayerIds(blueTeamPlayerIds[0], blueTeamPlayerIds[1]);

        if (!redTeam) {
            redTeam = createDefaultTeamForPlayers(redTeamPlayerIds[0], redTeamPlayerIds[1]);
        }
        if (!blueTeam) {
            blueTeam = createDefaultTeamForPlayers(blueTeamPlayerIds[0], blueTeamPlayerIds[1]);
        }
        teams['red'] = {
            score: 0,
            scoreAgainst: 0,
            side: 'red',
            teamId: redTeam._id,
            winner: false,
            ratingDelta: 0
        };
        teams['blue'] = {
            score: 0,
            scoreAgainst: 0,
            side: 'blue',
            teamId: blueTeam._id,
            winner: false,
            ratingDelta: 0
        };
    }

    // process points
    var point, side;
    for (p = 0; p < params.points.length; p++) {
        point = params.points[p];
        side = playerData[point.playerId].side;
        if (side === 'red') {
            if (!point.against) {
                redScore++;
            } else {
                blueScore++;
            }
        } else {
            if (!point.against) {
                blueScore++;
            } else {
                redScore++;
            }
        }

        if (point.against) {
            playerData[point.playerId].scoreAgainst++;
            if (teams[side]) {
                teams[side].scoreAgainst++;
            }
        } else {
            playerData[point.playerId].score++;
            if (teams[side]) {
                teams[side].score++;
            }
        }
    }
    var finished = (blueScore >= 10 || redScore >= 10) && Math.abs(blueScore - redScore) >= 2;
    var winnerSide = blueScore > redScore ? 'blue' : 'red';
    var gamePlayers = [];
    for (p = 0; p < params.gamePlayers.length; p++) {
        gamePlayer = params.gamePlayers[p];
        if (finished && (playerData[gamePlayer.playerId].side === winnerSide)) {
            playerData[gamePlayer.playerId].winner = true;
        }
        gamePlayers.push(playerData[gamePlayer.playerId]);
    }

    if (winnerSide && teams.red && teams.blue) {
        teams[winnerSide].winner = true;
    }
    var gameTeams = teams.red && teams.blue ? [teams.red, teams.blue] : [];

    return {
        leagueId: params.leagueId,
        time: time,
        finished: finished,
        gamePlayers: gamePlayers,
        gameTeams: gameTeams,
        points: params.points
    };
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
        _permissions: ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
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
            _permissions: ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
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
            _permissions: ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
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

    var time = new Date().toISOString();

    var commentNode = repoConn.create({
        _parentPath: gameNode._path,
        _permissions: ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
        type: TYPE.COMMENT,
        gameId: params.gameId,
        author: params.author,
        time: time,
        text: params.text,
        media: mediaAttachment && mediaAttachment.name,
        attachment: mediaAttachment
    });

    notifyGameUpdate(params.gameId);

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

    var existingLeaguePlayer = exports.getLeaguePlayerByLeagueIdAndPlayerId(leagueId, playerId);
    if (existingLeaguePlayer) {
        var updatedLeaguePlayer = repoConn.modify({
            key: existingLeaguePlayer._id,
            editor: function (node) {
                node.inactive = false;
                return node;
            }
        });
        repoConn.refresh('SEARCH');
        return updatedLeaguePlayer;
    }

    var leaguePlayer = repoConn.create({
        _parentPath: leagueNode._path + LEAGUE_PLAYERS_REL_PATH,
        _permissions: ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
        type: TYPE.LEAGUE_PLAYER,
        playerId: playerId,
        leagueId: leagueId,
        rating: rating
    });

    repoConn.refresh('SEARCH');

    return leaguePlayer;
};

/**
 * Remove a player from an existing league.
 *
 * @param {string} leagueId Id of the league.
 * @param {string} playerId Id of the player.
 */
exports.leavePlayerLeague = function (leagueId, playerId) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.LEAGUE_PLAYER + "' AND playerId='" + playerId + "' AND leagueId='" + leagueId + "'"
    });
    if (result.count === 0) {
        return;
    }

    repoConn.modify({
        key: result.hits[0].id,
        editor: function (node) {
            node.inactive = true;
            return node;
        }
    });

    repoConn.refresh('SEARCH');
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

    var existingLeagueTeam = exports.getLeagueTeamByLeagueIdAndTeamId(leagueId, teamId);
    if (existingLeagueTeam) {
        var updatedLeagueTeam = repoConn.modify({
            key: existingLeagueTeam._id,
            editor: function (node) {
                node.inactive = false;
                return node;
            }
        });
        repoConn.refresh('SEARCH');
        return updatedLeagueTeam;
    }

    var leagueTeam = repoConn.create({
        _parentPath: leagueNode._path + LEAGUE_TEAMS_REL_PATH,
        _permissions: ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
        type: TYPE.LEAGUE_TEAM,
        teamId: teamId,
        leagueId: leagueId,
        rating: rating
    });

    repoConn.refresh('SEARCH');

    return leagueTeam;
};

/**
 * Remove a team from an existing league.
 *
 * @param {string} leagueId Id of the league.
 * @param {string} teamId Id of the team.
 */
exports.leaveTeamLeague = function (leagueId, teamId) {
    var repoConn = newConnection();

    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "type = '" + TYPE.LEAGUE_TEAM + "' AND teamId='" + teamId + "' AND leagueId='" + leagueId + "'"
    });
    if (result.count === 0) {
        return;
    }

    repoConn.modify({
        key: result.hits[0].id,
        editor: function (node) {
            node.inactive = true;
            return node;
        }
    });

    repoConn.refresh('SEARCH');
};

/**
 * Modify an existing player.
 *
 * @param {object} params JSON with the player parameters.
 * @param {string} params.playerId Id of the player to update.
 * @param {string} [params.name] New name of the player.
 * @param {string} [params.fullname] New full name of the player.
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
        params.name = validateName(params.name);
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
            if (params.fullname != null) {
                node.fullname = params.fullname;
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
            if (params.userKey != null) { // TODO for testing, remove
                node.userKey = params.userKey;
            }
            if (imageAttachment) {
                node.image = imageAttachment.name;
                node.attachment = imageAttachment;
            }
            node._timestamp = valueLib.instant(new Date().toISOString());
            return node;
        }
    });

    return setImageUrl(playerNode);
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
        params.name = validateName(params.name);
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
            node._timestamp = valueLib.instant(new Date().toISOString())
            return node;
        }
    });

    return setImageUrl(teamNode);
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
 * @param {string[]} [params.adminPlayerIds] New array with ids of the admin players.
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
        params.name = validateName(params.name);
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
            if (params.adminPlayerIds != null) {
                node.adminPlayerIds = params.adminPlayerIds;
            }
            node._timestamp = valueLib.instant(new Date().toISOString())
            return node;
        }
    });

    return setImageUrl(leagueNode);
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
            node.rating = toInt((node.rating || 0) + ratingDelta);
            node._timestamp = valueLib.instant(new Date().toISOString());
            return node;
        }
    });
    return leaguePlayerNode;
};

/**
 * Set player rating in an existing league.
 *
 * @param {string} leagueId Id of the league.
 * @param {string} playerId Id of the player.
 * @param {number} rating Rating points.
 * @return {LeaguePlayer} Updated leaguePlayer.
 */
exports.setPlayerLeagueRating = function (leagueId, playerId, rating) {
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
            node.rating = toInt(rating);
            node._timestamp = valueLib.instant(new Date().toISOString());
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
            node.rating = toInt((node.rating || 0) + ratingDelta);
            node._timestamp = valueLib.instant(new Date().toISOString());
            return node;
        }
    });

    return leagueTeamNode;
};

/**
 * Set team rating in an existing league.
 *
 * @param {string} leagueId Id of the league.
 * @param {string} teamId Id of the team.
 * @param {number} rating Rating points.
 * @return {LeagueTeam} Updated leagueTeam.
 */
exports.setTeamLeagueRating = function (leagueId, teamId, rating) {
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
            node.rating = toInt(rating);
            node._timestamp = valueLib.instant(new Date().toISOString())
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
        query: "type = '" + TYPE.GAME + "' AND _id='" + params.gameId + "'"
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
                node._timestamp = valueLib.instant(new Date().toISOString());
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
                            node.score = toInt(gp.score);
                        }
                        if (gp.scoreAgainst != null) {
                            node.scoreAgainst = toInt(gp.scoreAgainst);
                        }
                        if (gp.winner != null) {
                            node.winner = gp.winner;
                        }
                        if (gp.ratingDelta != null) {
                            node.ratingDelta = toInt(gp.ratingDelta);
                        }
                        node._timestamp = valueLib.instant(new Date().toISOString());
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
                            node.score = toInt(gt.score);
                        }
                        if (gt.scoreAgainst != null) {
                            node.scoreAgainst = toInt(gt.scoreAgainst);
                        }
                        if (gt.winner != null) {
                            node.winner = gt.winner;
                        }
                        if (gt.ratingDelta != null) {
                            node.ratingDelta = toInt(gt.ratingDelta);
                        }
                        node._timestamp = valueLib.instant(new Date().toISOString());
                        return node;
                    }
                });
            })(gameTeam);
        }
    }

    notifyGameUpdate(params.gameId);
};

var notifyGameUpdate = function (gameId) {
    eventLib.send({
        type: OFFICE_LEAGUE_GAME_EVENT_ID,
        distributed: true,
        data: {
            gameId: gameId
        }
    });
};

/**
 * Apply ranking updates as a result of a game.
 *
 * @param {Game} game Game object.
 */
exports.updateGameRanking = function (game) {
    if (!game.finished) {
        log.info('Skipping game ranking changes, game not finished: ' + game._id);
        return;
    }

    var playerIds = game.gamePlayers.map(function (gp) {
        return gp.playerId;
    });
    var teamIds = game.gameTeams.map(function (gp) {
        return gp.teamId;
    });

    var leaguePlayers = exports.getLeaguePlayersByLeagueIdAndPlayerIds(game.leagueId, playerIds);
    var leagueTeams = exports.getLeagueTeamsByLeagueIdAndTeamIds(game.leagueId, teamIds);
    ratingLib.calculateGameRatings(game, leaguePlayers.hits, leagueTeams.hits);
    for (var j = 0; j < game.gamePlayers.length; j++) {
        exports.updatePlayerLeagueRating(game.leagueId, game.gamePlayers[j].playerId, game.gamePlayers[j].ratingDelta);
    }
    for (var k = 0; k < game.gameTeams.length; k++) {
        exports.updateTeamLeagueRating(game.leagueId, game.gameTeams[k].teamId, game.gameTeams[k].ratingDelta);
    }
    exports.updateGame({
        gameId: game._id,
        finished: true,
        gamePlayers: game.gamePlayers,
        gameTeams: game.gameTeams,
        points: game.points
    });
};

/**
 * Delete a league by its name.
 * @param  {string} name Name of the league.
 * @return {string|null} Deleted node ID.
 */
exports.deleteLeagueByName = function (name) {
    var league = exports.getLeagueByName(name);
    if (league) {
        var repoConn = newConnection();
        return repoConn.delete(league._id) ? league._id : null;
    }
    return null;
};

/**
 * Delete a league by its name.
 * @param  {string} id ID of the game.
 * @return {string|null} Delete node ID.
 */
exports.deleteGameById = function (id) {
    var game = exports.getGameById(id);
    if (game) {
        var repoConn = newConnection();
        return repoConn.delete(game._id) ? game._id : null;
    }
    return null;
};

/**
 * Log game ranking info.
 *
 * @param {Game} game Game object.
 */
exports.logGameRanking = function (game) {
    var playerIds = game.gamePlayers.map(function (gp) {
        return gp.playerId;
    });
    var teamIds = game.gameTeams.map(function (gp) {
        return gp.teamId;
    });
    var players = exports.getPlayersById(playerIds);
    var teams = exports.getTeamsById(teamIds);
    var gameInfo = {
        gameId: game._id,
        sides: {
            blue: {
                players: [],
                team: null
            },
            red: {
                players: [],
                team: null
            }
        }
    };
    game.gamePlayers.forEach(function (gp) {
        var p = itemById(players, '_id', gp.playerId);
        if (gp.side === 'red') {
            gameInfo.sides.red.players.push({'name': p.name, 'id': p._id, 'rating': gp.ratingDelta});
        } else if (gp.side === 'blue') {
            gameInfo.sides.blue.players.push({'name': p.name, 'id': p._id, 'rating': gp.ratingDelta});
        }
    });
    game.gameTeams.forEach(function (gt) {
        var t = itemById(teams, '_id', gt.teamId);
        if (gt.side === 'red') {
            gameInfo.sides.red.team = {'name': t.name, 'id': t._id, 'rating': gt.ratingDelta};
        } else if (gt.side === 'blue') {
            gameInfo.sides.blue.team = {'name': t.name, 'id': t._id, 'rating': gt.ratingDelta};
        }
    });
    log.info('Game ranking details: \r\n' + JSON.stringify(gameInfo, null, 2));
};

/**
 * Refresh the index.
 */
exports.refresh = function () {
    var repoConn = newConnection();
    repoConn.refresh('SEARCH');
};

/**
 * @return {RepoConnection} Connection to the node repository for office-league data.
 */
exports.getRepoConnection = function () {
    return newConnection();
};

var newConnection = function () {
    return nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master'
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
    var orientation;
    if (mimeType !== 'image/svg+xml') {
        orientation = imageLib.getImageOrientation(attachmentBinary);
    }

    return {
        name: attachmentName,
        binary: bin,
        mimeType: notNull(mimeType, 'mimeType'),
        label: label,
        size: attachmentBinary.size(),
        orientation: orientation
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

var extensionFromMimeType = function (mimeType) {
    var ext = '';
    if (mimeType.indexOf('image/png') > -1) {
        ext = '.png';
    } else if (mimeType.indexOf('image/jpg') > -1 || mimeType.indexOf('image/jpeg') > -1) {
        ext = '.jpg';
    } else if (mimeType.indexOf('image/gif') > -1) {
        ext = '.gif';
    } else if (mimeType.indexOf('image/svg+xml') > -1) {
        ext = '.svg';
    }
    return ext;
};

/**
 * Get object from array with matching property value.
 *
 * @param {Array} array Array of values.
 * @param {string} key Property key of the object.
 * @param {string} value Property value of the object.
 */
var itemById = function (array, key, value) {
    if (!array || array.length === 0) {
        return null;
    }
    var i, v;
    for (i = 0; i < array.length; i++) {
        v = array[i];
        if (v[key] === value) {
            return v
        }
    }
    return null;
};

/**
 * Convert boolean to string: 'true' or 'false'
 *
 * @param {boolean} value Boolean value.
 * @return {string} String value.
 */
var boolToStr = function (value) {
    return value ? 'true' : 'false';
};

/**
 * Convert number to int value.
 *
 * @param {number} value Number value.
 * @return {number} Int value.
 */
var toInt = function (value) {
    if (!value.intValue) {
        throw "Expected number value: [" + value + "]"
    }
    return value.intValue();
};

/**
 * Get image URL for league, team or player.
 *
 * @param {object} node Node object.
 * @return {string} Image URL.
 */
var getImageUrl = function (node) {
    var type;
    if (node.type === TYPE.LEAGUE) {
        type = 'leagues'
    } else if (node.type === TYPE.TEAM) {
        type = 'teams'
    } else if (node.type === TYPE.PLAYER) {
        type = 'players'
    } else {
        return '';
    }

    if (!node.image) {
        return '/' + type + '/image/-/default';
    }
    var version = node._versionKey;
    return '/' + type + '/image/' + version + '/' + node.name;
};

var setImageUrl = function (node) {
    if (node && (node.type === TYPE.LEAGUE || node.type === TYPE.PLAYER || node.type === TYPE.TEAM)) {
        node.imageUrl = getImageUrl(node);
    }
    return node;
};

var validateName = function (name) {
    name = (name || '').trim();
    if (name.length < NAME_MIN_LENGTH) {
        throw "Name is too short: '" + name + '"'
    }
    if (name.length > NAME_MAX_LENGTH) {
        throw "Name is too long: '" + name + '"'
    }
    if (hasInvalidChars(name)) {
        throw "Name contains invalid characters: '" + name + '"'
    }
    return name;
};

var prettifyName = function (text) {
    var namePrettyfier = Java.type('com.enonic.xp.name.NamePrettyfier');
    return namePrettyfier.create(text);
};

var hasInvalidChars = function (name) {
    for (var i = 0; i < name.length; i++) {
        var chr = name[i];
        if ((name.charCodeAt(i) < 32) || INVALID_NAME_CHARS[chr]) {
            return true;
        }
    }
    return false
};