import {Player} from './Player';
import {Team} from './Team';
import {XPCONFIG} from '../../app/app.config';

export enum LeagueSport {
    FOOS, TENNIS, DARTS
}

export class League {
    name: string;
    id: string;
    sport: LeagueSport = LeagueSport.FOOS;
    imageUrl: string;
    description: string;
    config: {[key: string]: string|number} = {};
    players: Player[];
    teams: Team[];

    constructor(name: string) {
        if (!name) {
            throw new Error('League.name can not be null');
        }
        this.name = name;
        this.imageUrl = `${XPCONFIG.baseHref}/leagues/image/${name}`;
    }

    static fromJson(json: any): League {
        let l = new League(json.name);
        l.sport = League.parseSport(json.sport);
        if (json.description) {
            l.description = json.description;
        }
        if (json.id) {
            l.id = json.id;
        }
        if (json.players && json.players.length > 0) {
            l.players = json.players.map(player => Player.fromJson(player));
        }
        if (json.teams && json.teams.length > 0) {
            l.teams = json.teams.map(team => Team.fromJson(team));
        }
        return l;
    }

    private static parseSport(value: any): LeagueSport {
        if (typeof value === 'string') {
            return LeagueSport[value.toUpperCase()];
        }
        return null;
    }
}
