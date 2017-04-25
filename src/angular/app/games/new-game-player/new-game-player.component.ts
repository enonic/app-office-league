import {Component, Input, Output, EventEmitter, ElementRef, HostBinding, HostListener} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {XPCONFIG} from '../../app.config';
import {MaterializeAction} from 'angular2-materialize';

@Component({
    selector: 'new-game-player',
    templateUrl: 'new-game-player.component.html',
    styleUrls: ['new-game-player.component.less']
})
export class NewGamePlayerComponent {
    materializeActions = new EventEmitter<string|MaterializeAction>();

    @Input() player: Player;
    @Input() leaguePlayerIds: string[];
    @Input() selectedPlayerIds: string[];
    @Input() sideClass: string;
    @Output() playerSelected: EventEmitter<Player> = new EventEmitter<Player>();

    playerSelectEnabled: boolean;
    public modalTitle: string = 'Select a player';

    constructor(private el: ElementRef) {
    }

    public setPlayer(player: Player) {
        this.player = player;
        this.playerSelected.emit(player);
    }

    onClicked() {
        this.showModal();
    }

    onSelected(p: Player) {
        if (p) {
            this.hideModal();
            this.playerSelected.emit(p);
        }
    }

    public showModal(): void {
        this.materializeActions.emit({action: "modal", params: ['open']});
        this.playerSelectEnabled = true;
    }

    public hideModal(): void {
        this.playerSelectEnabled = false;
        this.materializeActions.emit({action: "modal", params: ['close']});
    }

    questionMarkImg(): string {
        return `${XPCONFIG.assetsUrl}/img/questionmark.svg`;
    }
}
