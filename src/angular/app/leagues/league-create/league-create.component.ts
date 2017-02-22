import {Component, OnInit} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LeagueComponent} from '../league/league.component';

@Component({
    selector: 'league-create',
    templateUrl: 'league-create.component.html'
})
export class LeagueCreateComponent extends LeagueComponent implements OnInit {

    name: string;
    description: string;
    sport: string;

    constructor(service: GraphQLService, route: ActivatedRoute, router: Router) {
        super(service, route, router);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    onCreateClicked() {
        console.log('league-create');
        console.log(this.name, this.description, this.sport);

        this.service.post(this.getMutation(), this.getMutationVariables()).then(data => {
            if (data && data.createLeague) {
                this.router.navigate(['leagues', data.createLeague.id]);
            }
        });
    }

    private getMutation(): string {
        return `mutation ($name: String!, $description: String!, $sport: Sport!) {
  createLeague(name: $name, description: $description, sport: $sport) {
    id
    name
  }
}`;
    }

    private getMutationVariables(): {[key: string]: string} {
        return {
            name: this.name,
            description: this.description,
            sport: this.sport
        }

    }
}
