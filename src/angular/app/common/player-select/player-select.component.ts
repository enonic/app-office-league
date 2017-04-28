import {Component, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
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
    allPlayers: Player[] = [];
    players: Player[] = [];
    private selectedPlayer: Player;
    private ready: boolean;

    constructor(route: ActivatedRoute, router: Router, private graphQLService: GraphQLService, private elementRef: ElementRef) {
        super(route, router);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.observer = this;
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
        this.filterPlayers(undefined);
        this.ready = true;
    }

    private filterPlayers(searchValue: string = '') {
        this.players = this.allPlayers.filter(player => (this.excludedPlayerIds.indexOf(player.id) == -1) &&
                                                        (searchValue === '' || new RegExp(searchValue, "i").test(player.name)));
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

    private refresh(currentPage: number = 1, search: string = '') {
        this.filterPlayers(search);
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
