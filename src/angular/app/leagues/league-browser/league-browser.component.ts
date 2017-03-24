import {Component, Input, ElementRef, AfterViewInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConfigUser} from '../../app.config';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {PageTitleService} from '../../services/page-title.service';
declare var $: any;

@Component({
    selector: 'league-browser',
    templateUrl: 'league-browser.component.html'
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

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private pageTitleService: PageTitleService,
                private authService: AuthService,
                private elementRef: ElementRef) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let user: ConfigUser = this.authService.getUser();
        this.graphQLService.post(LeagueBrowserComponent.getLeaguesQuery, {playerId: user ? user.playerId : 'unknown'}).then((data: any) => {
            this.myLeagues = data.myLeagues.map(league => League.fromJson(league));
            let myLeagueIds = data.myLeagues.map(league => league.id);

            this.discoverLeagues = data.allLeagues.
                filter((league) => myLeagueIds.indexOf(league.id) == -1).
                map(league => League.fromJson(league));
        });

        this.pageTitleService.setTitle('Leagues');
    }

    ngAfterViewInit(): void {
        $(this.elementRef.nativeElement).find('ul.tabs').tabs();
    }
}
