import {Component, Input, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Handedness} from '../../../graphql/schemas/Handedness';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../graphql.service';
import {Countries} from '../../common/countries';
import {MaterializeDirective} from 'angular2-materialize/dist/index';
import {Country} from '../../common/country';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import {XPCONFIG} from '../../app.config';

@Component({
    selector: 'player-edit',
    templateUrl: 'player-edit.component.html',
    styleUrls: ['player-edit.component.less']
})
export class PlayerEditComponent extends BaseComponent implements AfterViewInit {

    name: string;
    id: string;
    nickname: string;
    nationality: string;
    handedness: string;
    description: string;
    imageUrl: string;

    countries: Country[] = [];
    @ViewChild('fileInput') inputEl: ElementRef;
    nameClasses: {} = {invalid: false};

    constructor(private http: Http, route: ActivatedRoute, private graphQLService: GraphQLService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];
        this.loadPlayer(name);
    }

    ngAfterViewInit(): void {
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
        inputEl.addEventListener('change', () => this.onFileInputChange(inputEl));
    }

    private loadPlayer(name) {
        this.graphQLService.post(PlayerEditComponent.getPlayerQuery, {name: name}).then(
            data => {
                const player = Player.fromJson(data.player);
                this.name = player.name;
                this.nickname = player.nickname;
                this.id = player.id;
                this.nationality = player.nationality;
                this.handedness = Handedness[player.handedness || Handedness.RIGHT].toLowerCase();
                this.description = player.description;
                this.imageUrl = player.imageUrl;

                this.countries = Countries.getCountries();

                // TODO, if not current player, redirect to profile view
            });
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

    savePlayer() {
        const updatePlayerParams = {
            playerId: this.id,
            name: this.name,
            description: this.description || '',
            nickname: this.nickname || '',
            nationality: this.nationality || '',
            handedness: this.handedness || Handedness[Handedness.RIGHT],
        };
        this.graphQLService.post(PlayerEditComponent.updatePlayerMutation, updatePlayerParams).then(data => {
            return data && data.updatePlayer;
        }).then(updatedPlayer => {
            this.uploadImage(updatedPlayer.id).then(uploadResp => {
                this.router.navigate(['players', updatedPlayer.name]);
            });
        });
    }

    private checkPlayerNameInUse(name: string): Promise<boolean> {
        return this.graphQLService.post(PlayerEditComponent.playerNameInUseQuery, {name: name}).then(data => {
            return data && data.player ? data.player.id !== this.id : false;
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

    private static readonly getPlayerQuery = `query($name: String){
        player(name: $name) {
            id
            name
            nickname
            nationality
            handedness
            description
        }
    }`;

    private static readonly playerNameInUseQuery = `query($name: String){
        player(name: $name) {
            id
        }
    }`;

    private static readonly updatePlayerMutation = `mutation ($playerId: ID!, $name: String, $nickname: String, $description: String, $nationality: String, $handedness: Handedness) {
        updatePlayer(id: $playerId, name: $name, nickname: $nickname, description: $description, nationality: $nationality, handedness: $handedness) {
            id
            name
        }
    }`;
}
