import {Component, Input, ElementRef, ViewChild, AfterViewInit, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../services/graphql.service';
import {MaterializeDirective, MaterializeAction} from 'angular2-materialize/dist/index';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import {XPCONFIG} from '../../app.config';
import {Team} from '../../../graphql/schemas/Team';
import {PageTitleService} from '../../services/page-title.service';
import {Player} from '../../../graphql/schemas/Player';
import {ImageService} from '../../services/image.service';
import {AuthService} from '../../services/auth.service';

@Component({
    selector: 'team-edit-create',
    templateUrl: 'team-edit-create.component.html',
    styleUrls: ['team-edit-create.component.less']
})
export class TeamEditCreateComponent extends BaseComponent implements AfterViewInit {
    materializeActions = new EventEmitter<string|MaterializeAction>();

    name: string;
    id: string;
    description: string;
    imageUrl: string;
    players: Player[] = [];
    createMode: boolean;
    excludePlayerIds: {[id: string]: boolean} = {};
    leagueIds: string[] = [];
    private currentPlayer: Player;

    @ViewChild('fileInput') inputEl: ElementRef;
    nameClasses: {} = {invalid: false};

    constructor(private http: Http, route: ActivatedRoute, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService, private router: Router, private authService: AuthService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

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
        this.graphQLService.post(TeamEditCreateComponent.getTeamQuery, {name: name}).then(
            data => {
                const team = Team.fromJson(data.team);
                this.name = team.name;
                this.id = team.id;
                this.description = team.description;
                this.imageUrl = team.imageUrl;
                this.players = team.players || [];
                this.pageTitleService.setTitle(team.name);
            });
    }

    private setupCreate() {
        let playerId = this.authService.getUser().playerId;
        this.graphQLService.post(TeamEditCreateComponent.getPlayerByIdQuery, {playerId: playerId}).then(
            data => {
                let playerTeamMates = data.player.teams.map((team) => {
                    return team.players.map((p) => p.id).filter((id) => id != playerId)[0];
                });
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
                playerTeamMates.forEach((playerId) => this.excludePlayerIds[playerId] = true);

                if (data.player && data.player.leaguePlayers) {
                    this.leagueIds = data.player.leaguePlayers.map((lp) => lp.league.id);
                }
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
                this.router.navigate(['teams', updatedTeam.name]);
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
                this.router.navigate(['teams', createdTeam.name]);
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
        this.nameClasses['invalid'] = !this.name;
        return !!this.name && (!this.createMode || this.players.length === 2);
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
            players {
                id
                name
            }
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

    private static readonly createTeamMutation = `mutation ($playerIds: [ID]!, $name: String!, $description: String) {
        createTeam(name: $name, description: $description, playerIds: $playerIds) {
            id
            name
        }
    }`;

    private static readonly getPlayerByIdQuery = `query($playerId: ID){
        player(id: $playerId) {
            id
            name
            leaguePlayers {
                league {
                    id
                }
            }
            teams(first:-1) {
              players {
                id
              }
            }
        }
    }`;
}
