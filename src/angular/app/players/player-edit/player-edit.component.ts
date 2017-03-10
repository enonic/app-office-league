import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Handedness} from '../../../graphql/schemas/Handedness';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../graphql.service';
import {Countries} from '../../common/countries';
import {MaterializeDirective} from 'angular2-materialize/dist/index';
import {Country} from '../../common/country';

@Component({
    selector: 'player-edit',
    templateUrl: 'player-edit.component.html',
    styleUrls: ['player-edit.component.less']
})
export class PlayerEditComponent extends BaseComponent {

    name: string;
    id: string;
    nickname: string;
    nationality: string;
    handedness: string;
    description: string;
    imageUrl: string;

    countries: Country[]=[];
    @ViewChild('fileInput') inputEl: ElementRef;
    nameClasses: {} = {invalid: false};

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];
        this.loadPlayer(name);
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
}
