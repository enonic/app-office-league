import {Component, OnInit, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter, ElementRef} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../services/graphql.service';

@Component({
    selector: 'player-select',
    templateUrl: 'player-select.component.html',
    styleUrls: ['player-select.component.less'],
    host: {
        '(document:click)': 'handlePageClick($event)',
        '(document:keydown)': 'handleKeyboardEvent($event)',
    },
})
export class PlayerSelectComponent implements OnInit, OnChanges {

    @Input() playerIds: string[];
    @Input() excludedPlayerIds: string[] = [];
    @Output() playerSelected: EventEmitter<Player> = new EventEmitter<Player>();
    allPlayers: Player[] = [];
    players: Player[] = [];
    private selectedPlayer: Player;
    private ready: boolean;

    constructor(private graphQLService: GraphQLService, private elementRef: ElementRef) {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        let playerIdsChange = changes['playerIds'];
        let excludedPlayerIdsChange = changes['excludedPlayerIds'];
        if (playerIdsChange) {
            this.loadAllPlayers();
        } else if (excludedPlayerIdsChange) {
            this.filterPlayers();
        }

    }

    private loadAllPlayers() {
        this.graphQLService.post(
            PlayerSelectComponent.GetPlayersQuery,
            {playerIds: this.playerIds, first: -1},
            data => this.handleResponse(data)
        );
    }

    private handleResponse(data) {
        this.allPlayers = data.players.map((player) => Player.fromJson(player));
        this.filterPlayers();
        this.ready = true;
    }

    private filterPlayers() {
        this.players = this.allPlayers.filter((player => this.excludedPlayerIds.indexOf(player.id) == -1));
    }

    onPlayerClicked(player: Player) {
        this.selectedPlayer = player;
        this.notifySelected();
    }

    private notifySelected() {
        this.playerSelected.emit(this.selectedPlayer);
    }

    handlePageClick(event) {
        if (!this.ready) {
            return;
        }

        let clickedComponent = event.target;
        let inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);
        if (!inside) {
            this.cancel();
        }
    }

    handleKeyboardEvent(event) {
        if (this.ready && event.keyCode === 27) {
            this.cancel();
        }
    }

    private cancel() {
        this.selectedPlayer = null;
        this.notifySelected();
    }

    static readonly GetPlayersQuery = `query ($playerIds: [ID], $first:Int) {
        players(ids: $playerIds, first: $first) {
            id
            name
            imageUrl
            nickname
        }
    }`;
}
