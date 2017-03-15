import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {XPCONFIG} from '../../app.config';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Sport, SportUtil} from '../../../graphql/schemas/Sport';
import {League} from '../../../graphql/schemas/League';
import {AuthService} from '../../auth.service';

@Component({
    selector: 'league-edit-create',
    templateUrl: 'league-edit-create.component.html',
    styleUrls: ['league-edit-create.component.less']
})
export class LeagueEditCreateComponent extends BaseComponent {

    @ViewChild('fileInput') inputEl: ElementRef;
    name: string;
    leagueId: string;
    description: string;
    leagueImageUrl: string;
    sport: string = Sport[Sport.FOOS].toLowerCase();
    nameClasses: {} = {invalid: false};
    editMode: boolean;

    constructor(private http: Http, private authService: AuthService, private graphQLService: GraphQLService, route: ActivatedRoute,
                private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];
        this.leagueImageUrl = this.getLeagueImageUrl();
        this.editMode = !!name;
        if (this.editMode) {
            this.loadLeague(name);
        }
    }

    private validate(): boolean {
        this.nameClasses['invalid'] = !this.name;
        return !!this.name && SportUtil.parse(this.sport) != null;
    }

    onUpdateClicked() {
        if (!this.validate()) {
            return;
        }

        const updateLeagueParams = {
            leagueId: this.leagueId,
            name: this.name,
            description: this.description || '',
            playerId: XPCONFIG.user.playerId
        };
        this.graphQLService.post(LeagueEditCreateComponent.updateLeagueMutation, updateLeagueParams).then(data => {
            return data && data.updateLeague;
        }).then(updatedLeague => {
            this.uploadImage(updatedLeague.id).then(uploadResp => {
                this.router.navigate(['leagues', updatedLeague.name]);
            });
        });
    }

    onCreateClicked() {
        if (!this.validate()) {
            return;
        }

        const createLeagueParams = {
            name: this.name,
            description: this.description || '',
            sport: this.sport,
            playerId: XPCONFIG.user.playerId
        };
        this.graphQLService.post(LeagueEditCreateComponent.createLeagueMutation, createLeagueParams).then(data => {
            return data && data.createLeague;
        }).then(createdLeague => {
            this.uploadImage(createdLeague.id).then(uploadResp => {
                this.router.navigate(['leagues', createdLeague.name]);
            });
        });
    }

    loadLeague(name: string): Promise<League> {
        let playerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';

        return this.graphQLService.post(LeagueEditCreateComponent.getLeagueQuery, {name: name, playerId: playerId}).then(data => {
            if (!data.league.isAdmin) {
                this.router.navigate(['leagues']);
                return null;
            }

            const league = League.fromJson(data.league);
            this.name = league.name;
            this.description = league.description;
            this.leagueId = league.id;
            this.leagueImageUrl = this.getLeagueImageUrl();
            const sport = SportUtil.parse(league.sport) || Sport.FOOS;
            this.sport = Sport[sport].toLowerCase();
            return league;
        });
    }

    private uploadImage(id: string): Promise<any> {
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
        let fileCount: number = inputEl.files.length;
        let formData = new FormData();

        if (fileCount > 0) {
            for (let i = 0; i < fileCount; i++) {
                formData.append('image', inputEl.files.item(i));
            }
            formData.append('type', 'league');
            formData.append('id', id);

            let headers = new Headers();
            headers.append('Accept', 'application/json');
            let options = new RequestOptions({headers: headers});
            return this.http.post(XPCONFIG.setImageUrl, formData, options)
                .map(this.extractData)
                .catch(this.handleError)
                .toPromise();
        }
        return Promise.resolve();
    }

    getLeagueImageUrl(): string {
        return new League('1', this.name || '_').imageUrl;
    }

    private static readonly createLeagueMutation = `mutation ($name: String!, $description: String!, $sport: Sport!, $playerId: ID) {
        createLeague(name: $name, description: $description, sport: $sport, adminPlayerIds: [$playerId]) {
            id
            name
        }
    }`;

    private static readonly updateLeagueMutation = `mutation ($leagueId: ID!, $name: String, $description: String, $playerId: ID) {
        updateLeague(id: $leagueId, name: $name, description: $description, adminPlayerIds: [$playerId]) {
            id
            name
        }
    }`;

    private static readonly getLeagueQuery = `query ($name: String, $playerId: ID!) {
        league(name: $name) {
            id
            name
            description
            sport
            isAdmin(playerId:$playerId)
        }
    }`;
}
