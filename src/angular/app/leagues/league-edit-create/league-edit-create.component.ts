import {AfterViewInit, Component, ElementRef, EventEmitter, ViewChild} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
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
import {Player} from '../../../graphql/schemas/Player';
import {MaterializeAction, MaterializeDirective} from 'angular2-materialize/dist/index';

@Component({
    selector: 'league-edit-create',
    templateUrl: 'league-edit-create.component.html',
    styleUrls: ['league-edit-create.component.less']
})
export class LeagueEditCreateComponent
    extends BaseComponent
    implements AfterViewInit {

    @ViewChild('fileInput') inputEl: ElementRef;
    name: string;
    leagueId: string;
    description: string;
    leagueImageUrl: SafeUrl;
    sport: string = Sport[Sport.FOOS].toLowerCase();
    admins: Player[] = [];
    adminPlayerIds: string[] = [];
    allPlayerIds: string[] = [];
    editMode: boolean;
    leagueForm: FormGroup;
    formErrors = {
        'name': '',
        'description': ''
    };
    materializeActions = new EventEmitter<string | MaterializeAction>();

    constructor(private http: Http, private authService: AuthService, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService, route: ActivatedRoute, private location: Location,
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
            this.loadLeague(name).then(() => this.loadAdminPlayerIds());
        } else {
            this.loadAdminPlayer().then(() => this.loadAdminPlayerIds());
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
        if (!this.leagueForm.valid || this.admins.length === 0) {
            return;
        }

        const updateLeagueParams = {
            leagueId: this.leagueId,
            name: this.name,
            description: this.description || '',
            adminPlayerIds: this.adminPlayerIds
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
        if (!this.leagueForm.valid || this.admins.length === 0) {
            return;
        }

        const createLeagueParams = {
            name: this.name,
            description: this.description || '',
            sport: this.sport,
            adminPlayerIds: this.adminPlayerIds
        };
        this.graphQLService.post(LeagueEditCreateComponent.createLeagueMutation, createLeagueParams).then(data => {
            return data && data.createLeague;
        }).then(createdLeague => {
            this.uploadImage(createdLeague.id).then(uploadResp => {
                this.router.navigate(['leagues', createdLeague.name], {replaceUrl: true});
            });
        });
    }

    onCancelClicked() {
        this.location.back();
    }

    loadAdminPlayerIds(): Promise<void> {
        return this.graphQLService.post(LeagueEditCreateComponent.getAllPlayerIdsQuery).then(data => {
            if (!data || !data.players) {
                return;
            }
            this.allPlayerIds = data.players.map(p => p.id);
            return;
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
            this.admins = league.adminPlayers;
            this.adminPlayerIds = this.admins.map((p) => p.id);

            this.pageTitleService.setTitle(league.name);

            this.leagueForm.setValue({
                name: league.name || '',
                description: league.description || '',
                id: league.id || ''
            });

            this.leagueForm.removeControl('name');
            this.leagueForm.addControl('name', new FormControl(league.name,
                [Validators.required, Validators.minLength(3), Validators.maxLength(40), CustomValidators.validName()],
                LeagueValidator.nameInUseValidator(this.graphQLService, league.id)));

            return league;
        });
    }

    loadAdminPlayer(): Promise<void> {
        let playerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';
        return this.graphQLService.post(LeagueEditCreateComponent.getPlayerQuery, {playerId: playerId}).then(data => {
            if (!data.player) {
                return null;
            }
            let player = Player.fromJson(data.player);
            this.admins = [player];
            this.adminPlayerIds = [player.id];
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

    onRemoveAdminClicked(admin: Player) {
        if (!admin) {
            return;
        }
        this.admins = this.admins.filter((player) => player.id !== admin.id);
        this.adminPlayerIds = this.admins.map((p) => p.id);
    }

    onAddAdminClicked() {
        this.showSelectAdminModal();
    }

    onAdminSelected(newAdmin: Player) {
        if (!newAdmin) {
            return;
        }
        let existing = this.admins.find((player) => player.id === newAdmin.id);
        if (!existing) {
            this.admins.push(newAdmin);
            this.adminPlayerIds = this.admins.map((p) => p.id);
        }
        this.hideSelectAdminModal();
    }

    showSelectAdminModal(): void {
        this.materializeActions.emit({action: "modal", params: ['open']});
    }

    hideSelectAdminModal(): void {
        this.materializeActions.emit({action: "modal", params: ['close']});
    }

    private static readonly createLeagueMutation = `mutation ($name: String!, $description: String!, $sport: Sport!, $adminPlayerIds: [ID]) {
        createLeague(name: $name, description: $description, sport: $sport, adminPlayerIds: $adminPlayerIds) {
            id
            name
            imageUrl
        }
    }`;

    private static readonly updateLeagueMutation = `mutation ($leagueId: ID!, $name: String, $description: String, $adminPlayerIds: [ID]) {
        updateLeague(id: $leagueId, name: $name, description: $description, adminPlayerIds: $adminPlayerIds) {
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
            adminPlayers(first: -1) {
                id
                name
                imageUrl
            }
        }
    }`;

    private static readonly getAllPlayerIdsQuery = `query{
        players(first: -1) {
            id
        }
    }`;

    private static readonly getPlayerQuery = `query ($playerId: ID){
        player(id: $playerId) {
            id
            name
            imageUrl
        }
    }`;
}
