import {Component, Input, ElementRef, AfterViewInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConfigUser} from '../../app.config';
import {GraphQLService} from '../../graphql.service';
import {AuthService} from '../../auth.service';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
declare var $: any;

@Component({
    selector: 'league-browser',
    templateUrl: 'league-browser.component.html'
})
export class LeagueBrowserComponent extends BaseComponent implements AfterViewInit {

    private static readonly myLeaguesQuery: string = `query($playerId: ID) {
        leagues(playerId:$playerId){
            id
            name 
            description 
        }
    }`;

    private static readonly allLeaguesQuery: string = `query {
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

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private authService: AuthService,
                private elementRef: ElementRef) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        if (this.autoLoad) {
            this.graphQLService.post(LeagueBrowserComponent.allLeaguesQuery).then((data: any) => {
                this.allLeagues = data.leagues.map(league => League.fromJson(league));
            });

            let user: ConfigUser = this.authService.getUser();
            if (user) {
                this.graphQLService.post(LeagueBrowserComponent.myLeaguesQuery, {playerId: user.playerId}).then((data: any) => {
                    this.myLeagues = data.leagues.map(league => League.fromJson(league));
                });
            }
        }
    }

    ngAfterViewInit(): void {
        $(this.elementRef.nativeElement).find('ul.tabs').tabs();
    }
}
