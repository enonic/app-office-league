import {Component, Input, Output, EventEmitter, ElementRef, HostBinding, HostListener, ViewChild} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {XPCONFIG} from '../../app.config';
import {Modal} from 'materialize-css';

@Component({
    selector: 'new-game-player',
    templateUrl: 'new-game-player.component.html',
    styleUrls: ['new-game-player.component.less']
})
export class NewGamePlayerComponent {
    materializeActions = new EventEmitter<string>();

    @Input() player: Player;
    @Input() leaguePlayerIds: string[];
    @Input() selectedPlayerIds: string[];
    @Input() sideClass: string;
    @Output() playerSelected: EventEmitter<Player> = new EventEmitter<Player>();

    @ViewChild('PlayerSelect') playerSelectedRef;

    private playerSelectedModal : Modal;

    playerSelectEnabled: boolean;
    public modalTitle: string = 'Select a player';

    constructor(private el: ElementRef) {
    }

    public setPlayer(player: Player) {
        this.player = player;
        this.playerSelected.emit(player);
    }

    ngAfterViewInit() {
        this.playerSelectedModal = Modal.init(this.playerSelectedRef.nativeElement, { dismissible: true, inDuration: 100, outDuration: 100});
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
        this.playerSelectedModal.open();
        this.playerSelectEnabled = true;
    }

    public hideModal(): void {
        this.playerSelectedModal.close();
        this.playerSelectEnabled = false;        
    }

    questionMarkImg(): string {
        return `${XPCONFIG.assetsUrl}/img/questionmark.svg`;
    }
}
