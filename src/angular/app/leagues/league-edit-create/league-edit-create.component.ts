import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {XPCONFIG} from '../../app.config';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Sport, SportUtil} from '../../../graphql/schemas/Sport';
import {League} from '../../../graphql/schemas/League';
import {AuthService} from '../../services/auth.service';
import {PageTitleService} from '../../services/page-title.service';
import {ImageService} from '../../services/image.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {LeagueValidator} from '../league-validator';
import {CustomValidators} from '../../common/validators';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
    selector: 'league-edit-create',
    templateUrl: 'league-edit-create.component.html',
    styleUrls: ['league-edit-create.component.less']
})
export class LeagueEditCreateComponent extends BaseComponent implements AfterViewInit {

    @ViewChild('fileInput') inputEl: ElementRef;
    name: string;
    leagueId: string;
    description: string;
    leagueImageUrl: SafeUrl;
    sport: string = Sport[Sport.FOOS].toLowerCase();
    editMode: boolean;
    leagueForm: FormGroup;
    formErrors = {
        'name': '',
        'description': ''
    };


    constructor(private http: Http, private authService: AuthService, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService, route: ActivatedRoute,
                private router: Router, private fb: FormBuilder, private sanitizer: DomSanitizer) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.leagueForm = this.fb.group({
            name: new FormControl(null,
                [Validators.required, CustomValidators.minLength(3), CustomValidators.maxLength(40), CustomValidators.validName()],
                LeagueValidator.nameInUseValidator(this.graphQLService)),
            description: null,
            id: null
        });
        const updateFormErrors = (data?: any) => {
            LeagueValidator.updateFormErrors(this.leagueForm, this.formErrors);
        };
        this.leagueForm.valueChanges.subscribe(data => updateFormErrors(data));
        this.leagueForm.statusChanges.subscribe(data => updateFormErrors(data));

        updateFormErrors(); // (re)set validation messages now

        let name = this.route.snapshot.params['name'];
        this.leagueImageUrl = ImageService.leagueDefault();
        this.editMode = !!name;
        if (this.editMode) {
            this.loadLeague(name);
        }
    }

    ngAfterViewInit(): void {
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
        inputEl.addEventListener('change', () => this.onFileInputChange(inputEl));
    }

    public updatePageTitle(title: string) {
        this.pageTitleService.setTitle(title);
    }

    onUpdateClicked() {
        if (!this.leagueForm.valid) {
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
                this.router.navigate(['leagues', updatedLeague.name], {replaceUrl: true});
            });
        });
    }

    onCreateClicked() {
        if (!this.leagueForm.valid) {
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
                this.router.navigate(['leagues', createdLeague.name], {replaceUrl: true});
            });
        });
    }

    loadLeague(name: string): Promise<League> {
        let playerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';

        return this.graphQLService.post(LeagueEditCreateComponent.getLeagueQuery, {name: name, playerId: playerId}).then(data => {
            if (!data.league || !data.league.isAdmin) {
                this.router.navigate(['leagues'], {replaceUrl: true});
                return null;
            }

            const league = League.fromJson(data.league);
            this.name = league.name;
            this.description = league.description;
            this.leagueId = league.id;
            this.leagueImageUrl = league.imageUrl;
            const sport = SportUtil.parse(league.sport) || Sport.FOOS;
            this.sport = Sport[sport].toLowerCase();

            this.pageTitleService.setTitle(league.name);

            this.leagueForm.setValue({
                name: league.name,
                description: league.description,
                id: league.id
            });

            this.leagueForm.removeControl('name');
            this.leagueForm.addControl('name', new FormControl(league.name,
                [Validators.required, Validators.minLength(3), Validators.maxLength(40), CustomValidators.validName()],
                LeagueValidator.nameInUseValidator(this.graphQLService, league.id)));

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

    private onFileInputChange(input: HTMLInputElement) {
        if (input.files && input.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => this.leagueImageUrl = this.sanitizer.bypassSecurityTrustUrl((<any>e.target).result);
            reader.readAsDataURL(input.files[0]);
        }
    }

    private static readonly createLeagueMutation = `mutation ($name: String!, $description: String!, $sport: Sport!, $playerId: ID) {
        createLeague(name: $name, description: $description, sport: $sport, adminPlayerIds: [$playerId]) {
            id
            name
            imageUrl
        }
    }`;

    private static readonly updateLeagueMutation = `mutation ($leagueId: ID!, $name: String, $description: String, $playerId: ID) {
        updateLeague(id: $leagueId, name: $name, description: $description, adminPlayerIds: [$playerId]) {
            id
            name
            imageUrl
        }
    }`;

    private static readonly getLeagueQuery = `query ($name: String, $playerId: ID!) {
        league(name: $name) {
            id
            name
            description
            sport
            imageUrl
            isAdmin(playerId:$playerId)
        }
    }`;
}
