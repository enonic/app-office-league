import {Injectable} from '@angular/core';
import {AngularIndexedDB} from 'angular2-indexeddb';
import {Game} from '../../graphql/schemas/Game';
import {SideUtil} from '../../graphql/schemas/Side';
import {Point} from '../../graphql/schemas/Point';
import {Player} from '../../graphql/schemas/Player';
import {League} from '../../graphql/schemas/League';
import {GamePlayer} from '../../graphql/schemas/GamePlayer';
import {GameTeam} from '../../graphql/schemas/GameTeam';
import {Team} from '../../graphql/schemas/Team';

interface OfflineGameJson {
    gameId?: string;
    league: OfflineLeagueJson;
    players: OfflineGamePlayerJson[];
    teams: OfflineGameTeamJson[];
    points: OfflineGamePointJson[];
}

interface OfflineLeagueJson {
    leagueId: string;
    name: string;
    imageUrl: string;
}

interface OfflineGamePlayerJson {
    playerId: string;
    name: string;
    nickname: string;
    imageUrl: string;
    side: string;
}

interface OfflineGameTeamJson {
    teamId: string;
    name: string;
    imageUrl: string;
    side: string;
}

interface OfflineGamePointJson {
    time: number;
    against: boolean;
    playerId: string;
}

@Injectable()
export class OfflinePersistenceService {

    private static readonly dbVersion = 1;
    private static readonly dbName = 'officeleague';
    private static readonly dbStoreName = 'game';

    saveGame(game: Game): Promise<Game> {
        return new Promise((resolve, reject) => {
            let gameJson = this.gameToJson(game);
            let db = this.getDb();

            this.openStore(db).then(() => {
                db.update(OfflinePersistenceService.dbStoreName, gameJson, gameJson.gameId).then(() => {
                    resolve(game);

                }, (error) => {
                    reject(error);

                }).catch((error) => {
                    reject(error);
                });
            });

        });
    }

    loadGame(gameId: string): Promise<Game> {
        return new Promise((resolve, reject) => {
            let db = this.getDb();

            this.openStore(db).then(() => {
                db.getByKey(OfflinePersistenceService.dbStoreName, gameId).then((gameJson) => {
                    let game = gameJson ? this.gameFromJson(gameJson) : null;
                    resolve(game);
                }, (error) => {
                    console.log(error);
                    reject(error);
                });
            });

        });
    }

    private getDb(): AngularIndexedDB {
        return new AngularIndexedDB(OfflinePersistenceService.dbName, OfflinePersistenceService.dbVersion);
    }

    private openStore(db: AngularIndexedDB): Promise<any> {
        return db.createStore(OfflinePersistenceService.dbVersion, (evt) => {
            let objectStore = evt.currentTarget.result.createObjectStore(OfflinePersistenceService.dbStoreName);
            objectStore.createIndex('gameId', 'gameId', {unique: true});

        });
    };

    private gameToJson(game: Game): OfflineGameJson {
        let players: OfflineGamePlayerJson[] = game.gamePlayers.map((gp) => {
            return {
                playerId: gp.player && gp.player.id,
                name: gp.player && gp.player.name,
                nickname: gp.player && gp.player.nickname,
                imageUrl: gp.player && gp.player.imageUrl,
                side: SideUtil.toString(gp.side)
            }
        });
        let teams: OfflineGameTeamJson[] = game.gameTeams.map((gp) => {
            return {
                teamId: gp.team && gp.team.id,
                name: gp.team && gp.team.name,
                imageUrl: gp.team && gp.team.imageUrl,
                side: SideUtil.toString(gp.side)
            }
        });
        let points: OfflineGamePointJson[] = game.points.map((p) => {
            return {
                time: p.time,
                against: p.against,
                playerId: p.player && p.player.id
            }
        });
        let leagueJson: OfflineLeagueJson = {
            leagueId: game.league && game.league.id,
            name: game.league && game.league.name,
            imageUrl: game.league && game.league.imageUrl,
        };
        let gameJson: OfflineGameJson = {
            gameId: game.id,
            league: leagueJson,
            players: players,
            teams: teams,
            points: points
        };

        return gameJson;
    }

    private gameFromJson(gameJson: OfflineGameJson): Game {
        let game = new Game(gameJson.gameId);
        game.league = new League(gameJson.league.leagueId, gameJson.league.name);
        game.league.imageUrl = gameJson.league.imageUrl;

        const playerById: { [playerId: string]: GamePlayer } = {};
        let gamePlayers: GamePlayer[] = gameJson.players.map((p) => {
            let gp = new GamePlayer(null);
            gp.side = SideUtil.parse(p.side);
            let player = new Player(p.playerId, p.name);
            player.imageUrl = p.imageUrl;
            player.nickname = p.nickname;
            gp.player = player;
            playerById[player.id] = gp;
            return gp;
        });
        const teamById: { [teamId: string]: GameTeam } = {};
        let gameTeams: GameTeam[] = gameJson.teams.map((p) => {
            let gp = new GameTeam(null);
            gp.side = SideUtil.parse(p.side);
            let team = new Team(p.teamId, p.name);
            team.imageUrl = p.imageUrl;
            gp.team = team;
            teamById[team.id] = gp;
            return gp;
        });
        game.gamePlayers = gamePlayers;
        game.gameTeams = gameTeams;
        game.points = gameJson.points.map((p) => {
            let point = new Point();
            point.time = p.time;
            point.against = p.against;
            let gp = playerById[p.playerId];
            point.player = gp.player;
            if (point.against) {
                playerById[p.playerId].scoreAgainst++;
            } else {
                playerById[p.playerId].score++;
            }
            return point;
        });

        return game;
    }
}
