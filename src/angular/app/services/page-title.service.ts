import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class PageTitleService {

    private title: Observable<string>;
    private titleSubject: Subject<string>;

    constructor() {
        this.titleSubject = new Subject();
        this.title = this.titleSubject.asObservable();
    }

    public subscribeTitle(listener: (title: string) => void): PageTitleService {
        this.title.subscribe(listener);
        return this;
    }

    public setTitle(title: string): PageTitleService {
        this.titleSubject.next(title && title.length > 0 ? title : '');
        return this;
    }

    public resetTitle(): PageTitleService {
        this.setTitle(null);
        return this;
    }

}
