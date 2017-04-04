import {Component, ElementRef, ViewChild, AfterViewInit, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {Handedness} from '../../../graphql/schemas/Handedness';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../services/graphql.service';
import {Countries} from '../../common/countries';
import {Country} from '../../common/country';
import {Http, Headers, RequestOptions} from '@angular/http';
import {XPCONFIG} from '../../app.config';
import {PageTitleService} from '../../services/page-title.service';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {PlayerValidator} from '../player-validator';
import {ImageService} from '../../services/image.service';

@Component({
    selector: 'player-edit',
    templateUrl: 'player-edit.component.html',
    styleUrls: ['player-edit.component.less']
})
export class PlayerEditComponent extends BaseComponent implements OnInit, AfterViewInit {

    playerForm: FormGroup;
    imageUrl: string;
    formErrors = {
        'name': '',
        'nickname': ''
    };

    countries: Country[] = [];
    @ViewChild('fileInput') inputEl: ElementRef;

    constructor(private http: Http, route: ActivatedRoute, private pageTitleService: PageTitleService,
                private graphQLService: GraphQLService,
                private router: Router, private location: Location, private fb: FormBuilder) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.playerForm = this.fb.group({
            name: new FormControl(null,
                [Validators.required, Validators.minLength(3), Validators.maxLength(30)],
                PlayerValidator.nameInUseValidator(this.graphQLService)),
            nickname: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(30)])],
            nationality: null,
            handedness: Handedness[Handedness.RIGHT].toLowerCase(),
            description: null,
            id: null
        });

        const updateFormErrors = (data?: any) => {
            PlayerValidator.updateFormErrors(this.playerForm, this.formErrors);
        };

        this.playerForm.valueChanges.subscribe(data => updateFormErrors(data));
        this.playerForm.statusChanges.subscribe(data => updateFormErrors(data));

        updateFormErrors(); // (re)set validation messages now

        this.imageUrl = ImageService.playerDefault();
        this.countries = Countries.getCountries();

        let name = this.route.snapshot.params['name'];
        this.pageTitleService.setTitle('Edit Player');
        this.loadPlayer(name);
    }

    ngAfterViewInit(): void {
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
        inputEl.addEventListener('change', () => this.onFileInputChange(inputEl));
    }

    public updatePageTitle(title: string) {
        this.pageTitleService.setTitle(title);
    }

    private loadPlayer(name) {
        this.graphQLService.post(
            PlayerEditComponent.getPlayerQuery,
            {name: name},
            data => this.handlePlayerQueryResponse(data)
        );
    }

    private handlePlayerQueryResponse(data) {
        const player = Player.fromJson(data.player);

        this.imageUrl = player.imageUrl;

        this.playerForm.setValue({
            name: player.name,
            nickname: player.nickname,
            nationality: player.nationality,
            handedness: Handedness[player.handedness].toLowerCase(),
            description: player.description,
            id: player.id
        });

        this.pageTitleService.setTitle(player.name);

        // TODO, if not current player, redirect to profile view
    }

    onSaveClicked() {
        if (!this.playerForm.valid) {
            return;
        }

        this.savePlayer();
    }

    onCancelClicked() {
        this.location.back();
    }

    savePlayer() {
        this.graphQLService.post(PlayerEditComponent.updatePlayerMutation, this.playerForm.value).then(data => {
            return data && data.updatePlayer;
        }).then(updatedPlayer => {
            this.uploadImage(updatedPlayer.id).then(uploadResp => {
                this.router.navigate(['players', updatedPlayer.name]);
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

    private static readonly getPlayerQuery = `query($name: String){
        player(name: $name) {
            id
            name
            imageUrl
            nickname
            nationality
            handedness
            description
        }
    }`;

    private static readonly updatePlayerMutation = `mutation ($playerId: ID!, $name: String, $nickname: String, $description: String, $nationality: String, $handedness: Handedness) {
        updatePlayer(id: $playerId, name: $name, nickname: $nickname, description: $description, nationality: $nationality, handedness: $handedness) {
            id
            name
            imageUrl
        }
    }`;
}
