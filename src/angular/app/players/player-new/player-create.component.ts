import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
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

@Component({
    selector: 'player-create',
    templateUrl: 'player-create.component.html',
    styleUrls: ['player-create.component.less']
})

export class PlayerCreateComponent
    extends BaseComponent
    implements AfterViewInit {

    playerForm: FormGroup;
    imageUrl: string;
    formErrors = {
        'name': '',
        'fullname': ''
    };

    countries: Country[] = [];
    @ViewChild('fileInput') inputEl: ElementRef;

    constructor(private http: Http, route: ActivatedRoute, private router: Router, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService,
                private auth: AuthService, private fb: FormBuilder) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        const user = this.auth.getUser();
        if (!this.auth.isNewUser()) {
            this.router.navigate(['players', user.playerName]);
            return;
        }

        this.playerForm = this.fb.group({
            name: new FormControl(user.playerName || null,
                [Validators.required, Validators.minLength(3), Validators.maxLength(30)],
                PlayerValidator.nameInUseValidator(this.graphQLService)),
            fullname: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(30)])],
            nationality: null,
            handedness: Handedness[Handedness.RIGHT].toLowerCase(),
            description: null
        });

        this.imageUrl = ImageService.playerDefault();
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

    onSaveClicked() {
        if (!this.playerForm.valid) {
            return;
        }

        this.savePlayer();
    }

    onCancelClicked() {
        window.location.href = XPCONFIG.logoutUrl;
    }

    savePlayer() {
        this.graphQLService.post(PlayerCreateComponent.createPlayerMutation, this.playerForm.value).then(data => {
            return data && data.createPlayer;
        }).then(createdPlayer => {
            if (createdPlayer) {
                const user = this.auth.getUser();
                user.playerName = createdPlayer.name;
                user.playerId = createdPlayer.id;
                this.uploadImage(createdPlayer.id).then(uploadResp => {
                    this.router.navigate(['players', createdPlayer.name]);
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
        let preview = document.getElementsByClassName('preview')[0];
        if (input.files && input.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => this.imageUrl = (<any>e.target).result;
            reader.readAsDataURL(input.files[0]);
        }
    }

    private static readonly createPlayerMutation = `mutation ($name: String!, $fullname: String, $description: String, $nationality: String, $handedness: Handedness) {
        createPlayer(name: $name, fullname: $fullname, description: $description, nationality: $nationality, handedness: $handedness) {
            id
            name
            imageUrl
        }
    }`;
}
