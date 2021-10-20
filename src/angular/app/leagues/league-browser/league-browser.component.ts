import {Component, Input, ElementRef, AfterViewInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConfigUser} from '../../app.config';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {OnlineStatusService} from '../../services/online-status.service';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'league-browser',
    templateUrl: 'league-browser.component.html',
    styleUrls: ['league-browser.component.less']
})
export class LeagueBrowserComponent extends BaseComponent implements AfterViewInit {

    private static readonly getLeaguesQuery: string = `query($playerId: ID, $leagueCount: Int) {
        myLeagues : leagues(playerId:$playerId, first: $leagueCount){
            id
            name 
            imageUrl
            description 
        }
        
        allLeagues: leagues(first: $leagueCount){
            id
            name 
            imageUrl
            description 
            games(first:1 , finished:true) {
                id
                time
            }
        }
    }`;

    @Input() myLeagues: League[] = [];
    @Input() discoverLeagues: League[];
    @Input() playerId: string;
    @Input() teamId: string;
    private online: boolean;
    private onlineStateCallback = () => this.online = navigator.onLine;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private pageTitleService: PageTitleService,
                public authService: AuthService, private onlineStatusService: OnlineStatusService,
                private elementRef: ElementRef) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let user: ConfigUser = this.authService.getUser();
        this.graphQLService.post(
            LeagueBrowserComponent.getLeaguesQuery,
            {
                playerId: user ? user.playerId : 'unknown',
                leagueCount: -1
            },
            data => this.handleLeaguesQueryResponse(data)
        );

        this.onlineStatusService.addOnlineStateEventListener(this.onlineStateCallback);
        this.online = navigator.onLine;

        this.pageTitleService.setTitle('Leagues');
    }

    ngOnDestroy(): void {
        this.onlineStatusService.removeOnlineStateEventListener(this.onlineStateCallback);
    }

    private handleLeaguesQueryResponse(data) {
        this.myLeagues = data.myLeagues.map(league => League.fromJson(league));
        if (this.myLeagues.length == 0) {
            $('ul.tabs').tabs('select', 'discoverLeagues');
        }
        let myLeagueIds = data.myLeagues.map(league => league.id);

        let leagues =
            data.allLeagues
                .filter((league) => myLeagueIds.indexOf(league.id) == -1)
                .map(league => League.fromJson(league));

        leagues.sort(LeagueBrowserComponent.compareLeagueByLastGameTime);
        this.discoverLeagues = leagues;
    }

    ngAfterViewInit(): void {
        $(this.elementRef.nativeElement).find('ul.tabs').tabs();
    }

    private static compareLeagueByLastGameTime(l1: League, l2: League) {
        if (l1.games.length === 0 && l2.games.length === 0) {
            return 0;
        } else if (l1.games.length === 0 && l2.games.length > 0) {
            return 1;
        } else if (l1.games.length > 0 && l2.games.length === 0) {
            return -1;
        }
        return l2.games[0].time.getTime() - l1.games[0].time.getTime();
    }
}
