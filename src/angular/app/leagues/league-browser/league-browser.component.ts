import {Component, OnInit, Input, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {AuthService} from '../../auth.service';
import {League} from '../../../graphql/schemas/League';
import {ListComponent} from '../../common/list.component';
//import * as jQuery from 'jquery';
declare var $: any;

@Component({
    selector: 'league-browser',
    templateUrl: 'league-browser.component.html'
})
export class LeagueBrowserComponent extends ListComponent implements OnInit {

    @Input() myLeagues: League[] = [];
    @Input() allLeagues: League[];
    @Input() playerId: string;
    @Input() teamId: string;
    selectedTab: string = "myLeagues";

    constructor(private router: Router, private service: GraphQLService, private authService: AuthService, route: ActivatedRoute,
                private elementRef: ElementRef) {
        super(route);


    }

    ngOnInit(): void {
        super.ngOnInit();
        if (this.autoLoad) {
            this.service.post(this.getAllLeaguesQuery()).then((data: any) => {
                this.allLeagues = data.leagues.map(league => League.fromJson(league));
            });

            let playerId = this.authService.getUser().playerId;
            if (playerId) {
                this.service.post(this.getMyLeaguesQuery(), {playerId: playerId}).then((data: any) => {
                    this.myLeagues = data.leagues.map(league => League.fromJson(league));
                });
            }
        }

        $(this.elementRef.nativeElement).find('ul.tabs').tabs();
    }

    selectTab(tab: string) {
        this.selectedTab = tab;
    }

    private getAllLeaguesQuery(): string { //TODO THis query is not correct. League component should retrieve its own data
        return `query {
                  leagues {
                    id
                    name
                    description
                    sport
                    leaguePlayers {
                      player {
                        name
                      }
                      league {
                        name
                      }
                    }
                    leagueTeams {
                      team {
                        name
                        players {
                          name
                        }
                      }
                      league {
                        name
                      }
                    }
                  }
                }`
    }

    private getMyLeaguesQuery(): string {
        return `query($playerId: ID) {
                  leagues(playerId:$playerId) {
                    id
                    name
                    description
                    sport
                    leaguePlayers {
                      player {
                        name
                      }
                      league {
                        name
                      }
                    }
                    leagueTeams {
                      team {
                        name
                        players {
                          name
                        }
                      }
                      league {
                        name
                      }
                    }
                  }
                }`
    }
}
