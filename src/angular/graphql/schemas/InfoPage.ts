export class InfoPage {
    name: string;
    title: string;
    body: string;

    constructor() {
    }

    static fromJson(json: any): InfoPage {
        let infoPage = new InfoPage();
        infoPage.name = json.name || '';
        infoPage.title = json.title || '';
        infoPage.body = json.body || '';
        return infoPage;
    }
}
