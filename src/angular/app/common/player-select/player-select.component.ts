import {Component, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter, ElementRef} from '@angular/core';
import {List2Component} from '../list2.component';
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
export class PlayerSelectComponent extends List2Component {

    @Input() playerIds: string[];
    @Input() excludedPlayerIds: string[] = [];
    @Output() playerSelectedEventEmitter: EventEmitter<Player> = new EventEmitter<Player>();
    players: Player[] = [];
    private selectedPlayer: Player;
    private ready: boolean;

    constructor(private graphQLService: GraphQLService, private elementRef: ElementRef) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        let playerIdsChange = changes['playerIds'];
        let excludedPlayerIdsChange = changes['excludedPlayerIds'];
        if (playerIdsChange || excludedPlayerIdsChange) {
            this.loadPlayers();
        }

    }

    private loadPlayers() {
        let playerIdsToLoad = this.playerIds.filter((playerId => this.excludedPlayerIds.indexOf(playerId) == -1));
        
        this.graphQLService.post(
            PlayerSelectComponent.GetPlayersQuery,
            {playerIds: playerIdsToLoad, first: -1},
            data => this.handleResponse(data)
        );
    }

    private handleResponse(data) {
        this.players = data.players.map((player) => Player.fromJson(player));
        this.ready = true;
    }

    onPlayerClicked(player: Player) {
        this.selectedPlayer = player;
        this.notifySelected();
    }

    private notifySelected() {
        this.playerSelectedEventEmitter.emit(this.selectedPlayer);
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
            description
        }
    }`;
}
