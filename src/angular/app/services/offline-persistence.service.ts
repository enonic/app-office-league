import {Injectable} from '@angular/core';
import {Game} from '../../graphql/schemas/Game';
import {SideUtil} from '../../graphql/schemas/Side';
import {Point} from '../../graphql/schemas/Point';
import {Player} from '../../graphql/schemas/Player';
import {League} from '../../graphql/schemas/League';
import {GamePlayer} from '../../graphql/schemas/GamePlayer';
import {GameTeam} from '../../graphql/schemas/GameTeam';
import {Team} from '../../graphql/schemas/Team';
import {GraphQLService} from './graphql.service';
import {IndexedDB} from './indexeddb';

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

    constructor(private graphQLService: GraphQLService) {
        this.bindEvents();
        setTimeout(() => {
            if (this.isOnline()) {
                this.pushOfflineGames();
            }
        }, 5000);
    }

    isOnline(): boolean {
        return navigator.onLine;
    }

    saveGame(game: Game): Promise<Game> {
        if (!game.id) {
            throw "Missing id for game: " + JSON.stringify(game);
        }
        return new Promise((resolve, reject) => {
            let gameJson = this.gameToJson(game);
            let db = this.getDb();

            this.openStore(db).then(() => {
                db.put(OfflinePersistenceService.dbStoreName, gameJson, gameJson.gameId).then(() => {
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
                db.get(OfflinePersistenceService.dbStoreName, gameId).then((gameJson) => {
                    let game = gameJson ? this.gameFromJson(gameJson) : null;
                    resolve(game);
                }, (error) => {
                    console.log(error);
                    reject(error);
                });
            });

        });
    }

    private pushOfflineGames() {
        this.fetchOfflineGames().then((offlineGamesJson: OfflineGameJson[]) => {
            offlineGamesJson.forEach((offlineGameJson: OfflineGameJson) => {
                this.fetchServerGame(offlineGameJson.gameId).then((game) => {
                    if (!game || game.points.length < offlineGameJson.points.length) {
                        console.log('Pushing offline game state: ', offlineGameJson);
                        this.storeGame(offlineGameJson).then((gameId) => {
                            // delete pushed game from local storage
                            this.deleteOfflineGame(offlineGameJson.gameId);
                        })
                    }
                })
            })
        });
    }

    private storeGame(offlineGameJson: OfflineGameJson): Promise<string> {
        debugger;
        if (!offlineGameJson.gameId || Game.isClientId(offlineGameJson.gameId)) {
            return this.createGame(offlineGameJson);
        } else {
            return this.updateGame(offlineGameJson);
        }
    }

    private updateGame(offlineGameJson: OfflineGameJson): Promise<string> {
        let players = offlineGameJson.players.map((p) => {
            return {"playerId": p.playerId, "side": p.side.toLowerCase()};
        });
        let points = offlineGameJson.points.map((p) => {
            return {time: p.time, playerId: p.playerId, against: p.against}
        });
        let updateGameParams = {points: points, players: players, gameId: offlineGameJson.gameId};
        return this.graphQLService.post(OfflinePersistenceService.updateGameMutation, updateGameParams)
            .then(data => {
                console.log('Game updated', data);
                return data.updateGame && data.updateGame.id;
            });
    }

    private createGame(offlineGameJson: OfflineGameJson): Promise<string> {
        let players = offlineGameJson.players.map((p) => {
            return {"playerId": p.playerId, "side": p.side.toLowerCase()};
        });
        let points = offlineGameJson.points.map((p) => {
            return {time: p.time, playerId: p.playerId, against: p.against}
        });
        let updateGameParams = {points: points, players: players, leagueId: offlineGameJson.league.leagueId};
        return this.graphQLService.post(OfflinePersistenceService.createGameMutation, updateGameParams)
            .then(data => {
                console.log('Game created', data);
                return data.createGame && data.createGame.id;
            });
    }

    private fetchServerGame(gameId: string): Promise<Game> {
        return this.graphQLService.post(OfflinePersistenceService.getGameQuery, {gameId: gameId})
            .then(data => {
                return data.game && Game.fromJson(data.game);
            });
    }

    private fetchOfflineGames(): Promise<OfflineGameJson[]> {
        return new Promise((resolve, reject) => {
            let db = this.getDb();

            this.openStore(db).then(() => {
                db.getAll(OfflinePersistenceService.dbStoreName).then((games) => {
                    resolve(games);
                }, (error) => {
                    reject(error);
                });
            });
        });
    }

    private deleteOfflineGame(gameId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let db = this.getDb();

            this.openStore(db).then(() => {
                db.remove(OfflinePersistenceService.dbStoreName, gameId).then(() => {
                    resolve();
                }, (error) => {
                    reject();
                });
            });
        });
    }

    private bindEvents() {
        window.addEventListener('offline', () => this.onOfflineStatus());
        window.addEventListener('online', () => this.onOnlineStatus());
    }

    private onOfflineStatus() {
        console.log('Going offline');
    }

    private onOnlineStatus() {
        console.log('Back online');
        this.pushOfflineGames();
    }

    private getDb(): IndexedDB {
        return new IndexedDB(OfflinePersistenceService.dbName, OfflinePersistenceService.dbVersion);
    }

    private openStore(db: IndexedDB): Promise<any> {
        return db.createStore((evt) => {
            let objectStore = (<any>evt.currentTarget).result.createObjectStore(OfflinePersistenceService.dbStoreName);
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

    private static readonly getGameQuery = `query ($gameId: ID!) {
      game(id: $gameId) {
        id
        finished
        points {
          time
        }
      }
    }`;

    private static readonly updateGameMutation = `mutation ($gameId: ID!, $points: [PointCreation], $players: [GamePlayerCreation]!) {
        updateGame(gameId: $gameId, points: $points, gamePlayers: $players) {
            id
        }
    }`;

    static readonly createGameMutation = `mutation ($leagueId: ID!, $points: [PointCreation], $players: [GamePlayerCreation]!) {
        createGame(leagueId: $leagueId, points: $points, gamePlayers: $players) {
            id
        }
    }`;
}
