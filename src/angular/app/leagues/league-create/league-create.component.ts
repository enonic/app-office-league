import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LeagueComponent} from '../league/league.component';
import {XPCONFIG} from '../../app.config';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Sport, SportUtil} from '../../../graphql/schemas/Sport';

@Component({
    selector: 'league-create',
    templateUrl: 'league-create.component.html'
})
export class LeagueCreateComponent extends LeagueComponent implements OnInit {

    @ViewChild('fileInput') inputEl: ElementRef;

    name: string;
    description: string;
    sport: string = Sport[Sport.FOOS].toLowerCase();
    nameClasses: {} = {invalid: false};

    static readonly CreateLeagueMutation = `mutation ($name: String!, $description: String!, $sport: Sport!, $playerId: ID) {
  createLeague(name: $name, description: $description, sport: $sport, adminPlayerIds: [$playerId]) {
    id
    name
  }
}`;

    constructor(private http: Http, service: GraphQLService, route: ActivatedRoute, router: Router) {
        super(service, route, router);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    private validate(): boolean {
        this.nameClasses['invalid'] = !this.name
        return !!this.name && SportUtil.parse(this.sport) != null;
    }

    onCreateClicked() {
        if (!this.validate()) {
            return;
        }

        this.service.post(LeagueCreateComponent.CreateLeagueMutation, this.getMutationVariables()).then(data => {
            return data && data.createLeague;
        }).then(createLeague => {
            this.uploadImage(createLeague.id).then(uploadResp => {
                this.router.navigate(['leagues', createLeague.id]);
            });
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

    private extractData(res: Response) {
        let json = res.json();
        return json.data || {};
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    private getMutationVariables(): {[key: string]: string} {
        return {
            name: this.name,
            description: this.description || '',
            sport: this.sport,
            playerId: XPCONFIG.user.playerId
        }
    }
}
