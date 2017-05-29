import {AfterViewInit, Component, ElementRef, EventEmitter, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../services/graphql.service';
import {MaterializeAction} from 'angular2-materialize/dist/index';
import {Headers, Http, RequestOptions} from '@angular/http';
import {XPCONFIG} from '../../app.config';
import {Team} from '../../../graphql/schemas/Team';
import {PageTitleService} from '../../services/page-title.service';
import {Player} from '../../../graphql/schemas/Player';
import {ImageService} from '../../services/image.service';
import {AuthService} from '../../services/auth.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TeamValidator} from '../team-validator';
import {CustomValidators} from '../../common/validators';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
    selector: 'team-edit-create',
    templateUrl: 'team-edit-create.component.html',
    styleUrls: ['team-edit-create.component.less']
})
export class TeamEditCreateComponent
    extends BaseComponent
    implements AfterViewInit {
    materializeActions = new EventEmitter<string | MaterializeAction>();

    name: string;
    id: string;
    description: string;
    imageUrl: SafeUrl;
    players: Player[] = [];
    createMode: boolean;
    excludePlayerIds: { [id: string]: boolean } = {};
    possibleTeamMateIds: string[] = [];
    leagueIds: string[] = [];
    teamForm: FormGroup;
    formErrors = {
        'name': '',
        'description': ''
    };
    private currentPlayer: Player;

    @ViewChild('fileInput') inputEl: ElementRef;

    constructor(private http: Http, route: ActivatedRoute, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService, private router: Router, private location: Location,
                private authService: AuthService, private fb: FormBuilder, private sanitizer: DomSanitizer) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.teamForm = this.fb.group({
            name: new FormControl(null,
                [Validators.required, CustomValidators.minLength(3), CustomValidators.maxLength(40), CustomValidators.validName()],
                TeamValidator.nameInUseValidator(this.graphQLService)),
            description: null,
            id: null
        });
        const updateFormErrors = (data?: any) => {
            TeamValidator.updateFormErrors(this.teamForm, this.formErrors);
        };
        this.teamForm.valueChanges.subscribe(data => updateFormErrors(data));
        this.teamForm.statusChanges.subscribe(data => updateFormErrors(data));

        updateFormErrors(); // (re)set validation messages now

        let name = this.route.snapshot.params['name'];
        if (name) {
            this.loadTeam(name);
        } else {
            this.setupCreate();
        }
    }

    ngAfterViewInit(): void {
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
        inputEl.addEventListener('change', () => this.onFileInputChange(inputEl));
    }

    private updatePageTitle(title: string) {
        this.pageTitleService.setTitle(title);
    }

    private loadTeam(name) {
        this.graphQLService.post(
            TeamEditCreateComponent.getTeamQuery,
            {name: name},
            data => this.handleTeamQueryResponse(data)
        );
    }

    private handleTeamQueryResponse(data) {
        const team = Team.fromJson(data.team);
        this.name = team.name;
        this.id = team.id;
        this.description = team.description;
        this.imageUrl = team.imageUrl;
        this.players = team.players || [];
        this.pageTitleService.setTitle(team.name);

        this.teamForm.removeControl('name');
        this.teamForm.addControl('name', new FormControl(team.name,
            [Validators.required, CustomValidators.minLength(3), CustomValidators.maxLength(40), CustomValidators.validName()],
            TeamValidator.nameInUseValidator(this.graphQLService, team.id)));

        this.teamForm.setValue({
            name: team.name || '',
            description: team.description || '',
            id: team.id || ''
        });
    }

    private setupCreate() {
        let playerId = this.authService.getUser().playerId;
        this.graphQLService.post(
            TeamEditCreateComponent.getPlayerByIdQuery,
            {playerId: playerId},
            data => this.handlePlayerByIdQueryResponse(data, playerId)
        );
    }

    private handlePlayerByIdQueryResponse(data, playerId) {
        let playerTeamMateIds = data.player.teams.map((team) => {
            return team.players.map((p) => p.id).filter((id) => id != playerId)[0];
        });

        let possibleTeamMateIds = new Set();
        data.player.leaguePlayers.forEach((leaguePlayer => {
            leaguePlayer.league.leaguePlayers.forEach((relatedLeaguePlayer) => {
                if (relatedLeaguePlayer.player.id != data.player.id) {
                    possibleTeamMateIds.add(relatedLeaguePlayer.player.id);
                }
            });
        }));
        playerTeamMateIds.forEach((playerTeamMateId) => {
            possibleTeamMateIds.delete(playerTeamMateId);
        });
        this.possibleTeamMateIds = Array.from(possibleTeamMateIds);

        delete data.player.teams;
        const player = Player.fromJson(data.player);
        this.name = '';
        this.id = '';
        this.description = '';
        this.imageUrl = ImageService.teamDefault();
        this.players = [player];
        this.currentPlayer = player;
        this.createMode = true;
        this.excludePlayerIds[player.id] = true;
        playerTeamMateIds.forEach((playerId) => this.excludePlayerIds[playerId] = true);

        if (data.player && data.player.leaguePlayers) {
            this.leagueIds = data.player.leaguePlayers.map((lp) => lp.league.id);
        }
    }

    onSaveClicked() {
        if (!this.teamForm.valid || !this.validate()) {
            return;
        }

        this.checkTeamNameInUse(this.name).then(teamNameInUse => {
            if (!teamNameInUse) {
                this.saveTeam();
            }
        });
    }

    onCancelClicked() {
        this.location.back();
    }

    onSelectPlayerClicked() {
        this.showModal();
    }

    private updateTeam() {
        const updateTeamParams = {
            teamId: this.id,
            name: this.name,
            description: this.description || '',
        };
        this.graphQLService.post(TeamEditCreateComponent.updateTeamMutation, updateTeamParams).then(data => {
            return data && data.updateTeam;
        }).then(updatedTeam => {
            this.uploadImage(updatedTeam.id).then(uploadResp => {
                this.router.navigate(['teams', updatedTeam.name], {replaceUrl: true});
            });
        });
    }

    private createTeam() {
        const createTeamParams = {
            playerIds: [this.players[0].id, this.players[1].id],
            name: this.name,
            description: this.description || '',
        };
        this.graphQLService.post(TeamEditCreateComponent.createTeamMutation, createTeamParams).then(data => {
            return data && data.createTeam;
        }).then(createdTeam => {
            this.uploadImage(createdTeam.id).then(uploadResp => {
                this.router.navigate(['teams', createdTeam.name], {replaceUrl: true});
            });
        });
    }

    saveTeam() {
        if (this.createMode) {
            this.createTeam();
        } else {
            this.updateTeam();
        }
    }

    onPlayerSelected(p: Player) {
        if (p) {
            this.hideModal();
            this.players = [this.currentPlayer, p];
        }
    }

    public showModal(): void {
        this.materializeActions.emit({action: "modal", params: ['open']});
    }

    public hideModal(): void {
        this.materializeActions.emit({action: "modal", params: ['close']});
    }

    private checkTeamNameInUse(name: string): Promise<boolean> {
        return this.graphQLService.post(TeamEditCreateComponent.teamNameInUseQuery, {name: name}).then(data => {
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
        return (!this.createMode || this.players.length === 2);
    }

    private onFileInputChange(input: HTMLInputElement) {
        if (input.files && input.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => this.imageUrl = this.sanitizer.bypassSecurityTrustUrl((<any>e.target).result);
            reader.readAsDataURL(input.files[0]);
        }
    }

    private static readonly getTeamQuery = `query($name: String){
        team(name: $name) {
            id
            name
            imageUrl
            description
            players {
                id
                name
                imageUrl
            }
        }
    }`;

    private static readonly teamNameInUseQuery = `query($name: String){
        team(name: $name) {
            id
            imageUrl
        }
    }`;

    private static readonly updateTeamMutation = `mutation ($teamId: ID!, $name: String, $description: String) {
        updateTeam(id: $teamId, name: $name, description: $description) {
            id
            name
            imageUrl
        }
    }`;

    private static readonly createTeamMutation = `mutation ($playerIds: [ID]!, $name: String!, $description: String) {
        createTeam(name: $name, description: $description, playerIds: $playerIds) {
            id
            name
            imageUrl
        }
    }`;

    private static readonly getPlayerByIdQuery = `query($playerId: ID){
        player(id: $playerId) {
            id
            name
            imageUrl
            leaguePlayers(first:-1) {
                league {
                    id
                    imageUrl
                    leaguePlayers(first:-1) {
                        player {
                            id
                            imageUrl
                        }
                    }
                }
            }
            teams(first:-1) {
                players {
                    id
                    imageUrl
                }
            }
        }
    }`;
}
