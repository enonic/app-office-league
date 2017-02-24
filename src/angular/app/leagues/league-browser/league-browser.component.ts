import {Component, OnInit, Input, ElementRef} from '@angular/core';
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
export class LeagueBrowserComponent extends ListComponent implements OnInit {

    @Input() myLeagues: League[] = [];
    @Input() allLeagues: League[];
    @Input() playerId: string;
    @Input() teamId: string;
    selectedTab: string = "myLeagues";

    constructor(route: ActivatedRoute, private service: GraphQLService, private authService: AuthService, private elementRef: ElementRef) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        console.log('LeagueBrowserComponent.ngOnInit');
        console.log('autoLoad:' + this.autoLoad);
        if (this.autoLoad) {
            this.service.post(this.getAllLeaguesQuery()).then((data: any) => {
                this.allLeagues = data.leagues.map(league => League.fromJson(league));
            });

            let user: ConfigUser = this.authService.getUser();
            if (user) {
                this.service.post(this.getMyLeaguesQuery(), {playerId: user.playerId}).then((data: any) => {
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
