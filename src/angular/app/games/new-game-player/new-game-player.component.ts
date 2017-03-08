import {Component, OnInit, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {XPCONFIG} from '../../app.config';
import {MaterializeDirective, MaterializeAction} from 'angular2-materialize/dist/index';

@Component({
    selector: 'new-game-player',
    templateUrl: 'new-game-player.component.html',
    styleUrls: ['new-game-player.component.less']
})
export class NewGamePlayerComponent implements OnInit, OnChanges {
    materializeActions = new EventEmitter<string|MaterializeAction>();

    @Input() player: Player;
    @Input() leagueId: string;
    @Input() excludePlayerIds: {[id: string]: boolean} = {};
    @Input() sideClass: string;
    @Output() playerSelected: EventEmitter<Player> = new EventEmitter<Player>();
    playerSelectEnabled: boolean;
    private modalTitle: string = 'Select a player';

    constructor() {
    }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    onClicked() {
        this.showModal();
    }

    onSelected(p: Player) {
        this.hideModal();
        this.playerSelected.emit(p);
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
