import {Component, Input, ElementRef, AfterViewInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConfigUser} from '../../app.config';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {OnlineStatusService} from '../../services/online-status.service';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {PageTitleService} from '../../services/page-title.service';
declare var $: any;

@Component({
    selector: 'league-browser',
    templateUrl: 'league-browser.component.html',
    styleUrls: ['league-browser.component.less']
})
export class LeagueBrowserComponent extends BaseComponent implements AfterViewInit {

    private static readonly getLeaguesQuery: string = `query($playerId: ID) {
        myLeagues : leagues(playerId:$playerId){
            id
            name 
            imageUrl
            description 
        }
        
        allLeagues: leagues{
            id
            name 
            imageUrl
            description 
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
            {playerId: user ? user.playerId : 'unknown'},
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
            $('ul.tabs').tabs('select_tab', 'discoverLeagues');
        }
        let myLeagueIds = data.myLeagues.map(league => league.id);

        this.discoverLeagues =
            data.allLeagues
                .filter((league) => myLeagueIds.indexOf(league.id) == -1)
                .map(league => League.fromJson(league));
    }

    ngAfterViewInit(): void {
        $(this.elementRef.nativeElement).find('ul.tabs').tabs();
    }
}
