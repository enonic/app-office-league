import {AfterViewInit, Component, ElementRef, EventEmitter, ViewChild} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {BaseComponent} from '../../common/base.component';
import {Sport, SportUtil} from '../../../graphql/schemas/Sport';
import {League} from '../../../graphql/schemas/League';
import {AuthService} from '../../services/auth.service';
import {PageTitleService} from '../../services/page-title.service';
import {ImageService} from '../../services/image.service';
import {OnlineStatusService} from '../../services/online-status.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {LeagueValidator} from '../league-validator';
import {CustomValidators} from '../../common/validators';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {Player} from '../../../graphql/schemas/Player';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, lastValueFrom, map } from 'rxjs';
import { Config } from '../../app.config';
import { MaterializeAction } from 'angular2-materialize';

declare var XPCONFIG: Config;

@Component({
    selector: 'league-edit-create',
    templateUrl: 'league-edit-create.component.html',
    styleUrls: ['league-edit-create.component.less']
})
export class LeagueEditCreateComponent
    extends BaseComponent
    implements AfterViewInit {

    private static readonly DEFAULT_POINTS_TO_WIN: number = 10;
    private static readonly DEFAULT_MIN_DIFFERENCE: number = 2;

    @ViewChild('fileInput') inputEl: ElementRef;
    @ViewChild('addPlayerChips') addPlayerChipsViewChild;
    name: string;
    leagueId: string;
    description: string;
    leagueImageUrl: SafeUrl;
    pointsToWin: string;
    minimumDifference: string;
    halfTimeSwitch: boolean = true;
    sport: string = Sport[Sport.FOOS].toLowerCase();
    admins: Player[] = [];
    adminPlayerIds: string[] = [];
    adminPlayerNames: string[] = [];
    onlyPlayers: Player[] = [];
    onlyPlayerNames: string[] = [];
    onlyPlayerNamesToAdd: string[] = [];
    playerNames: string[] = [];
    allPlayerIds: string[] = [];
    allPlayerNames: string[] = [];
    allPlayerMap: any = {};
    editMode: boolean;
    leagueForm: FormGroup;
    formErrors = {
        'name': '',
        'description': '',
        'pointsToWin': '',
        'minimumDifference': ''
    };
    materializeActionsAdmin = new EventEmitter<string | MaterializeAction>();
    materializeActionsPlayer = new EventEmitter<any>();
    private online: boolean;
    private onlineStateCallback = () => this.online = navigator.onLine;

    constructor(private http: HttpClient, private authService: AuthService, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService, private onlineStatusService: OnlineStatusService,
                route: ActivatedRoute, private location: Location, private router: Router, private fb: FormBuilder,
                private sanitizer: DomSanitizer) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.leagueForm = this.fb.group({
            name: new FormControl(null,
                [Validators.required, CustomValidators.minLength(3), CustomValidators.maxLength(40), CustomValidators.validName()],
                LeagueValidator.nameInUseValidator(this.graphQLService)),
            description: null,
            id: null,
            pointsToWin: new FormControl(null, [Validators.required, CustomValidators.integer(2, 100)]),
            minimumDifference: new FormControl(null, [Validators.required, CustomValidators.integer(1, 10)])
        }, {validator: LeagueValidator.minimumDifference()});

        const updateFormErrors = (data?: any) => {
            LeagueValidator.updateFormErrors(this.leagueForm, this.formErrors);
        };
        this.leagueForm.valueChanges.subscribe(data => updateFormErrors(data));
        this.leagueForm.statusChanges.subscribe(data => updateFormErrors(data));
        this.onlineStatusService.addOnlineStateEventListener(this.onlineStateCallback);
        this.online = navigator.onLine;

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
        this.leagueForm.patchValue({
            pointsToWin: LeagueEditCreateComponent.DEFAULT_POINTS_TO_WIN + '',
            minimumDifference: LeagueEditCreateComponent.DEFAULT_MIN_DIFFERENCE + ''
        });
    }

    ngOnDestroy(): void {
        this.onlineStatusService.removeOnlineStateEventListener(this.onlineStateCallback);
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
            adminPlayerIds: this.adminPlayerIds,
            pointsToWin: parseInt(this.pointsToWin, 10),
            minimumDifference: parseInt(this.minimumDifference, 10),
            halfTimeSwitch: this.halfTimeSwitch
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
            adminPlayerIds: this.adminPlayerIds,
            playerNames: this.playerNames,
            pointsToWin: parseInt(this.pointsToWin, 10),
            minimumDifference: parseInt(this.minimumDifference, 10),
            halfTimeSwitch: this.halfTimeSwitch
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
        return this.graphQLService.post(LeagueEditCreateComponent.getAllPlayersQuery).then(data => {
            if (!data || !data.players) {
                return;
            }
            this.allPlayerIds = data.players.map(p => p.id);
            this.allPlayerNames = data.players.map(p => p.name);
            this.allPlayerMap = {};
            data.players.forEach(p => this.allPlayerMap[p.name] = Player.fromJson(p));
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
            this.adminPlayerNames = this.admins.map((p) => p.name);
            // rules
            this.pointsToWin = league.rules.pointsToWin + '';
            this.minimumDifference = league.rules.minimumDifference + '';
            this.halfTimeSwitch = league.rules.halfTimeSwitch;

            this.pageTitleService.setTitle(league.name);

            this.leagueForm.setValue({
                name: league.name || '',
                description: league.description || '',
                id: league.id || '',
                pointsToWin: this.pointsToWin || '',
                minimumDifference: this.minimumDifference || ''
            });

            this.leagueForm.removeControl('name');
            this.leagueForm.addControl('name', new FormControl(league.name,
                [Validators.required, Validators.minLength(3), Validators.maxLength(40), CustomValidators.validName()],
                LeagueValidator.nameInUseValidator(this.graphQLService, league.id)));

            this.leagueForm.removeControl('pointsToWin');
            this.leagueForm.addControl('pointsToWin',
                new FormControl(this.pointsToWin, [Validators.required, CustomValidators.integer(2, 100)]));
            this.leagueForm.removeControl('minimumDifference');
            this.leagueForm.addControl('minimumDifference',
                new FormControl(this.minimumDifference, [Validators.required, CustomValidators.integer(1, 10)]));
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
            this.adminPlayerNames = [player.id];
            this.onlyPlayers = [];
            this.onlyPlayerNames = [];
            this.playerNames = [player.name];
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

            const httpOptions = {
                headers: new HttpHeaders({
                    'Accept': 'application/json'
                })
            };

            return lastValueFrom(this.http.post(XPCONFIG.setImageUrl, formData, httpOptions).pipe(
                map((dto: any) => dto.data),
                catchError(this.handleError)
            ));
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
        this.adminPlayerIds = this.adminPlayerIds.filter((playerId) => playerId !== admin.id);
        this.adminPlayerNames = this.adminPlayerNames.filter((playerName) => playerName !== admin.name);
        this.playerNames = this.playerNames.filter((playerName) => playerName !== admin.name);

    }

    onRemovePlayerClicked(removedPlayer: Player) {
        if (!removedPlayer) {
            return;
        }
        this.onlyPlayers = this.onlyPlayers.filter((player) => player.name !== removedPlayer.name);
        this.onlyPlayerNames = this.onlyPlayerNames.filter((playerName) => playerName !== removedPlayer.name);
        this.playerNames = this.playerNames.filter((playerName) => playerName !== removedPlayer.name);
    }

    onAddAdminClicked() {
        this.showSelectAdminModal();
    }

    onAddPlayerClicked() {
        this.showSelectPlayerModal();
    }

    onAdminSelected(newAdmin: Player) {
        if (!newAdmin) {
            return;
        }
        let existing = this.admins.find((player) => player.id === newAdmin.id);
        if (!existing) {
            this.admins.push(newAdmin);
            this.adminPlayerIds.push(newAdmin.id);
            this.adminPlayerNames.push(newAdmin.name);
            this.onRemovePlayerClicked(newAdmin);
            this.playerNames.push(newAdmin.name);
        }
        this.hideSelectAdminModal();
    }

    onPlayersSelected() {
        this.onlyPlayerNamesToAdd.forEach((playerName) => {
            if ((this.allPlayerMap[playerName] || playerName.indexOf('@') !== -1) && this.playerNames.indexOf(playerName) === -1) {
                let player = this.allPlayerMap[playerName] || new Player(undefined, playerName);
                this.onlyPlayers.push(player);
                this.onlyPlayerNames.push(playerName);
                this.playerNames.push(playerName);
            }
        });
        this.hideSelectPlayerModal();
    }

    showSelectAdminModal(): void {
        this.materializeActionsAdmin.emit({action: "modal", params: ['open']});
    }

    showSelectPlayerModal(): void {
        this.onlyPlayerNamesToAdd = [];
        this.materializeActionsPlayer.emit({action: "modal", params: ['open']});
        setTimeout(() => this.addPlayerChipsViewChild.focus(), 300); //No possibility to set a callback on display
    }

    hideSelectAdminModal(): void {
        this.materializeActionsAdmin.emit({action: "modal", params: ['close']});
    }

    hideSelectPlayerModal(): void {
        this.materializeActionsPlayer.emit({action: "modal", params: ['close']});
    }

    private static readonly createLeagueMutation = `mutation ($name: String!, $description: String!, $sport: Sport!, $adminPlayerIds: [ID], $playerNames: [String], $pointsToWin: Int, $minimumDifference: Int, $halfTimeSwitch: Boolean) {
        createLeague(name: $name, description: $description, sport: $sport, adminPlayerIds: $adminPlayerIds, playerNames: $playerNames, pointsToWin: $pointsToWin, minimumDifference: $minimumDifference, halfTimeSwitch: $halfTimeSwitch) {
            id
            name
            imageUrl
            rules {
                pointsToWin
                minimumDifference
                halfTimeSwitch
            }
        }
    }`;

    private static readonly updateLeagueMutation = `mutation ($leagueId: ID!, $name: String, $description: String, $adminPlayerIds: [ID], $pointsToWin: Int, $minimumDifference: Int, $halfTimeSwitch: Boolean) {
        updateLeague(id: $leagueId, name: $name, description: $description, adminPlayerIds: $adminPlayerIds, pointsToWin: $pointsToWin, minimumDifference: $minimumDifference, halfTimeSwitch: $halfTimeSwitch) {
            id
            name
            imageUrl
            rules {
                pointsToWin
                minimumDifference
                halfTimeSwitch
            }
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
            rules {
                pointsToWin
                minimumDifference
                halfTimeSwitch
            }
        }
    }`;

    private static readonly getAllPlayersQuery = `query{
        players(first: -1) {
            id
            name
            imageUrl
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
