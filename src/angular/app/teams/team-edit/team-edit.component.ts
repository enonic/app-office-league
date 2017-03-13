import {Component, Input, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../graphql.service';
import {MaterializeDirective} from 'angular2-materialize/dist/index';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import {XPCONFIG} from '../../app.config';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'team-edit',
    templateUrl: 'team-edit.component.html',
    styleUrls: ['team-edit.component.less']
})
export class TeamEditComponent extends BaseComponent implements AfterViewInit {

    name: string;
    id: string;
    description: string;
    imageUrl: string;

    @ViewChild('fileInput') inputEl: ElementRef;
    nameClasses: {} = {invalid: false};

    constructor(private http: Http, route: ActivatedRoute, private graphQLService: GraphQLService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];
        this.loadTeam(name);
    }

    ngAfterViewInit(): void {
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
        inputEl.addEventListener('change', () => this.onFileInputChange(inputEl));
    }

    private loadTeam(name) {
        this.graphQLService.post(TeamEditComponent.getTeamQuery, {name: name}).then(
            data => {
                const team = Team.fromJson(data.team);
                this.name = team.name;
                this.id = team.id;
                this.description = team.description;
                this.imageUrl = team.imageUrl;
            });
    }

    onSaveClicked() {
        if (!this.validate()) {
            return;
        }

        this.checkTeamNameInUse(this.name).then(teamNameInUse => {
            if (teamNameInUse) {
                this.nameClasses['invalid'] = true;
            } else {
                this.saveTeam();
            }
        });
    }

    saveTeam() {
        const updateTeamParams = {
            teamId: this.id,
            name: this.name,
            description: this.description || '',
        };
        this.graphQLService.post(TeamEditComponent.updateTeamMutation, updateTeamParams).then(data => {
            return data && data.updateTeam;
        }).then(updatedTeam => {
            this.uploadImage(updatedTeam.id).then(uploadResp => {
                this.router.navigate(['teams', updatedTeam.name]);
            });
        });
    }

    private checkTeamNameInUse(name: string): Promise<boolean> {
        return this.graphQLService.post(TeamEditComponent.teamNameInUseQuery, {name: name}).then(data => {
            return data && data.team ? data.team.id !== this.id : false;
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
            formData.append('type', 'team');
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

    private validate(): boolean {
        this.nameClasses['invalid'] = !this.name;
        return !!this.name;
    }

    private onFileInputChange(input: HTMLInputElement) {
        let preview = document.getElementsByClassName('preview')[0];
        if (input.files && input.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                preview.setAttribute('src', (<any>e.target).result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    private static readonly getTeamQuery = `query($name: String){
        team(name: $name) {
            id
            name
            description
        }
    }`;

    private static readonly teamNameInUseQuery = `query($name: String){
        team(name: $name) {
            id
        }
    }`;

    private static readonly updateTeamMutation = `mutation ($teamId: ID!, $name: String, $description: String) {
        updateTeam(id: $teamId, name: $name, description: $description) {
            id
            name
        }
    }`;
}
