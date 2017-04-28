import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Player} from '../../graphql/schemas/Player';

@Injectable()
export class UserProfileService {

    private player: Observable<Player>;
    private playerSubject: Subject<Player>;

    constructor() {
        this.playerSubject = new Subject();
        this.player = this.playerSubject.asObservable();
    }

    public subscribePlayer(listener: (player: Player) => void): UserProfileService {
        this.player.subscribe(listener);
        return this;
    }

    public setPlayer(player: Player): UserProfileService {
        this.playerSubject.next(player);
        return this;
    }

}