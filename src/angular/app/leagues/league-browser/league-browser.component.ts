import {Component, Input, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ConfigUser} from '../../app.config';
import {GraphQLService} from '../../graphql.service';
import {AuthService} from '../../auth.service';
import {League} from '../../../graphql/schemas/League';
import {ListComponent} from '../../common/list.component';
declare var $: any;

@Component({
    selector: 'league-browser',
    templateUrl: 'league-browser.component.html'
})
export class LeagueBrowserComponent extends ListComponent {

    private static myLeaguesQuery: string = `query($playerId: ID) {
        leagues(playerId:$playerId){
            id
            name 
            description 
        }
    }`;

    private static allLeaguesQuery: string = `query {
        leagues{
            id
            name 
            description 
        }
    }`;

    @Input() myLeagues: League[] = [];
    @Input() allLeagues: League[];
    @Input() playerId: string;
    @Input() teamId: string;
    selectedTab: string = 'myLeagues';

    constructor(route: ActivatedRoute, private service: GraphQLService, private authService: AuthService, private elementRef: ElementRef) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        if (this.autoLoad) {
            this.service.post(LeagueBrowserComponent.allLeaguesQuery).then((data: any) => {
                this.allLeagues = data.leagues.map(league => League.fromJson(league));
            });

            let user: ConfigUser = this.authService.getUser();
            if (user) {
                this.service.post(LeagueBrowserComponent.myLeaguesQuery, {playerId: user.playerId}).then((data: any) => {
                    this.myLeagues = data.leagues.map(league => League.fromJson(league));
                });
            }
        }

        $(this.elementRef.nativeElement).find('ul.tabs').tabs();
    }

    selectTab(tab: string) {
        this.selectedTab = tab;
    }
}
