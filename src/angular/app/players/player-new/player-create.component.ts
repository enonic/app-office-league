import {Component, Input, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Handedness} from '../../../graphql/schemas/Handedness';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../services/graphql.service';
import {Countries} from '../../common/countries';
import {Country} from '../../common/country';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import {XPCONFIG} from '../../app.config';
import {ImageService} from '../../services/image.service';
import {AuthService} from '../../services/auth.service';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'player-create',
    templateUrl: 'player-create.component.html',
    styleUrls: ['player-create.component.less']
})
export class PlayerCreateComponent extends BaseComponent implements AfterViewInit {

    name: string;
    nickname: string;
    nationality: string;
    handedness: string;
    description: string;
    imageUrl: string;

    countries: Country[] = [];
    @ViewChild('fileInput') inputEl: ElementRef;
    nameClasses: {} = {invalid: false};

    constructor(private http: Http, route: ActivatedRoute, private router: Router, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService,
                private auth: AuthService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        const user = this.auth.getUser();
        if (!this.auth.isNewUser()) {
            this.router.navigate(['players', user.playerName]);
            return;
        }

        this.name = user.playerName || '';
        this.handedness = Handedness[Handedness.RIGHT].toLowerCase();
        this.countries = Countries.getCountries();
        this.imageUrl = ImageService.playerDefault();
        this.pageTitleService.setTitle('Create Player');
    }

    ngAfterViewInit(): void {
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
        inputEl.addEventListener('change', () => this.onFileInputChange(inputEl));
    }

    private updatePageTitle(title: string) {
        this.pageTitleService.setTitle(title);
    }

    getNationality(): string {
        return Countries.getCountryName(this.nationality);
    }

    onSaveClicked() {
        if (!this.validate()) {
            return;
        }

        this.checkPlayerNameInUse(this.name).then(playerNameInUse => {
            if (playerNameInUse) {
                this.nameClasses['invalid'] = true;
            } else {
                this.savePlayer();
            }
        });
    }

    onCancelClicked() {
        window.location.href = XPCONFIG.logoutUrl;
    }

    savePlayer() {
        const createPlayerParams = {
            name: this.name,
            description: this.description || '',
            nickname: this.nickname || '',
            nationality: this.nationality || '',
            handedness: this.handedness || Handedness[Handedness.RIGHT],
        };

        this.graphQLService.post(PlayerCreateComponent.createPlayerMutation, createPlayerParams).then(data => {
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

    private checkPlayerNameInUse(name: string): Promise<boolean> {
        return this.graphQLService.post(PlayerCreateComponent.playerNameInUseQuery, {name: name}).then(data => {
            return data && data.player;
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

    private static readonly playerNameInUseQuery = `query($name: String){
        player(name: $name) {
            id
            imageUrl
        }
    }`;

    private static readonly createPlayerMutation = `mutation ($name: String!, $nickname: String, $description: String, $nationality: String, $handedness: Handedness) {
        createPlayer(name: $name, nickname: $nickname, description: $description, nationality: $nationality, handedness: $handedness) {
            id
            name
            imageUrl
        }
    }`;
}
