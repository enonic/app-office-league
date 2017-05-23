import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Handedness} from '../../../graphql/schemas/Handedness';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../services/graphql.service';
import {Countries} from '../../common/countries';
import {Country} from '../../common/country';
import {Headers, Http, RequestOptions} from '@angular/http';
import {XPCONFIG} from '../../app.config';
import {ImageService} from '../../services/image.service';
import {AuthService} from '../../services/auth.service';
import {PageTitleService} from '../../services/page-title.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {PlayerValidator} from '../player-validator';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {Player} from '../../../graphql/schemas/Player';
import {UserProfileService} from '../../services/user-profile.service';
import {CustomValidators} from '../../common/validators';

@Component({
    selector: 'player-create',
    templateUrl: 'player-create.component.html',
    styleUrls: ['player-create.component.less']
})

export class PlayerCreateComponent extends BaseComponent implements OnInit, AfterViewInit {

    playerForm: FormGroup;
    imageUrl: SafeUrl;
    formErrors = {
        'name': '',
        'fullname': ''
    };
    countries: Country[] = [];
    invitation: string;
    @ViewChild('fileInput') inputEl: ElementRef;

    constructor(private http: Http, route: ActivatedRoute, private router: Router, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService,
                private auth: AuthService, private fb: FormBuilder, private sanitizer: DomSanitizer,
                private userProfileService: UserProfileService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        const user = this.auth.getUser();
        if (!this.auth.isNewUser()) {
            this.router.navigate([''], {replaceUrl: true});
            return;
        }

        this.playerForm = this.fb.group({
            name: new FormControl(null,
                [Validators.required, Validators.minLength(3), Validators.maxLength(40), CustomValidators.validName(), CustomValidators.validNoWhitespace()],
                PlayerValidator.nameInUseValidator(this.graphQLService)),
            fullname: [user.playerName || null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(40)])],
            nationality: null,
            handedness: Handedness[Handedness.RIGHT].toLowerCase(),
            description: null,
            invitation: new FormControl()
        });

        this.route.queryParams.subscribe(params => {
            this.invitation = params['invitation'];
        });

        this.imageUrl = ''; //ImageService.playerDefault();
        this.countries = Countries.getCountries();
        this.pageTitleService.setTitle('Create Player');

        const updateFormErrors = (data?: any) => {
            PlayerValidator.updateFormErrors(this.playerForm, this.formErrors);
        };

        this.playerForm.valueChanges.subscribe(data => updateFormErrors(data));
        this.playerForm.statusChanges.subscribe(data => updateFormErrors(data));

        updateFormErrors(); // (re)set validation messages now
    }

    ngAfterViewInit(): void {
        if (this.inputEl) {
            let inputEl: HTMLInputElement = this.inputEl.nativeElement;
            inputEl.addEventListener('change', () => this.onFileInputChange(inputEl));
        }
    }

    public updatePageTitle(title: string) {
        this.pageTitleService.setTitle(title);
    }
    
    onCancelClicked() {
        return this.auth.logoutToMarketingPage();
    }

    onSaveClicked() {
        if (!this.playerForm.valid) {
            return;
        }

        this.savePlayer();
    }

    savePlayer() {
        console.log('this.playerForm.value', this.playerForm.value);
        this.graphQLService.post(PlayerCreateComponent.createPlayerMutation, {
            name: this.playerForm.value.name,
            fullname: this.playerForm.value.fullname,
            description: this.playerForm.value.description,
            nationality: this.playerForm.value.nationality,
            handedness: this.playerForm.value.handedness,
            invitation: this.invitation || null,
        }).then(data => {
            return data && data.createPlayer;
        }).then(createdPlayer => {
            if (createdPlayer) {
                const player = Player.fromJson(createdPlayer);
                const user = this.auth.getUser();
                user.playerName = player.name;
                user.playerId = player.id;
                this.uploadImage(player.id).then(uploadResp => {
                    this.router.navigate([''], {replaceUrl: true});
                }).then(() => this.graphQLService.post(PlayerCreateComponent.getPlayerQuery, {name: player.name})).then((data) => {
                    const player = Player.fromJson(data.player);
                    this.userProfileService.setPlayer(player);
                });
            }
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
            formData.append('type', 'player');
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
            reader.onload = (e) => this.imageUrl = this.sanitizer.bypassSecurityTrustUrl((<any>e.target).result);
            reader.readAsDataURL(input.files[0]);
        }
    }

    private static readonly createPlayerMutation = `mutation ($name: String!, $fullname: String, $description: String, $nationality: String, $handedness: Handedness, $invitation: String) {
        createPlayer(name: $name, fullname: $fullname, description: $description, nationality: $nationality, handedness: $handedness, invitation: $invitation) {
            id
            name
            imageUrl
        }
    }`;

    private static readonly getPlayerQuery = `query($name: String){
        player(name: $name) {
            id
            name
            imageUrl
            fullname
            nationality
            handedness
            description
        }
    }`;

}
