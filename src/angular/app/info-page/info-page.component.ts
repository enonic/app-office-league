import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../common/base.component';
import {GraphQLService} from '../services/graphql.service';
import {InfoPage} from '../../graphql/schemas/InfoPage';
import {PageTitleService} from '../services/page-title.service';
import { Config } from '../app.config';

declare var XPCONFIG: Config;

@Component({
    selector: 'info-page',
    templateUrl: 'info-page.component.html',
    styleUrls: ['info-page.component.less']
})
export class InfoPageComponent extends BaseComponent {

    connectionError: boolean;
    infoPage: any;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private pageTitleService: PageTitleService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.retrieveInfoPage();
        this.route.params.subscribe(() => this.retrieveInfoPage());        
    }
    
    retrieveInfoPage() {
        let name = this.route.snapshot.params['info-page'] || (XPCONFIG.content && XPCONFIG.content.name);
        this.graphQLService.post(
            InfoPageComponent.getInfoPageQuery,
            {name: name},
                data => this.handleInfoPageQueryResponse(data),
            () => this.handleQueryError()
        ).catch(error => {
                this.handleQueryError();
            });
        
    }

    handleInfoPageQueryResponse(data): void {
        this.infoPage = InfoPage.fromJson(data.infoPage);
        this.pageTitleService.setTitle(this.infoPage.title);
        this.connectionError = false;
    }

    private handleQueryError() {
        this.connectionError = true;
    }


    private static readonly getInfoPageQuery = `query($name: String){
        infoPage(name: $name) {
            title
            body
        }
    }`;

}
