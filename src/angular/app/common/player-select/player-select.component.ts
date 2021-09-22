import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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
    @Input() materializeActions: EventEmitter<any> = new EventEmitter<any>();
    @Output() playerSelected: EventEmitter<Player> = new EventEmitter<Player>();
    allPlayers: Player[] = [];
    players: Player[] = [];
    private selectedPlayer: Player;
    private ready: boolean;

    constructor(route: ActivatedRoute, router: Router, private graphQLService: GraphQLService, private elementRef: ElementRef) {
        super(route, router);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.searchValue = '';
        if (this.materializeActions) {
            this.materializeActions.subscribe((materialAction: any) => {
                if (materialAction.params && materialAction.params[0] === 'open') {
                    this.searchValue = '';
                    this.onSearchFieldModified();
                }
            });
        }
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
        this.filterPlayers(this.searchValue);
        this.ready = true;
    }

    private filterPlayers(searchValue: string = '') {
        const regexp = new RegExp(searchValue, "i");

        this.players = this.allPlayers.filter(player => {
            return (this.excludedPlayerIds.indexOf(player.id) == -1) &&
                   (searchValue === '' || regexp.test(player.name) || regexp.test(player.fullname) )
        });
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

    private refresh(currentPage: number = 1, searchValue: string = '') {
        this.filterPlayers(searchValue);
    }

    static readonly GetPlayersQuery = `query ($playerIds: [ID], $first:Int) {
        players(ids: $playerIds, first: $first) {
            id
            name
            fullname
            imageUrl
            description
        }
    }`;
}
