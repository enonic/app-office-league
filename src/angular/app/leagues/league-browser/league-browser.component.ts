import {Component, Input, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConfigUser} from '../../app.config';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {OnlineStatusService} from '../../services/online-status.service';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {PageTitleService} from '../../services/page-title.service';
import {MatTabGroup} from '@angular/material/tabs';

@Component({
    selector: 'league-browser',
    templateUrl: 'league-browser.component.html',
    styleUrls: ['league-browser.component.less']
})

export class LeagueBrowserComponent extends BaseComponent implements OnDestroy {
    @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
    @Input() myLeagues: League[] = [];
    @Input() discoverLeagues: League[];
    @Input() playerId: string;
    @Input() teamId: string;
    online: boolean;
    private onlineStateCallback = () => this.online = navigator.onLine;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private pageTitleService: PageTitleService,
                public authService: AuthService, private onlineStatusService: OnlineStatusService) {
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
            // Switch to the 'Discover' tab programmatically if 'My Leagues' is empty
            setTimeout(() => this.tabGroup.selectedIndex = 1, 0); // using setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        }
        let myLeagueIds = data.myLeagues.map(league => league.id);

        let leagues =
            data.allLeagues
                .filter((league) => myLeagueIds.indexOf(league.id) == -1)
                .map(league => League.fromJson(league));

        leagues.sort(LeagueBrowserComponent.compareLeagueByLastGameTime);
        this.discoverLeagues = leagues;
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
}
