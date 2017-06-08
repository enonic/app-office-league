import {Injectable} from '@angular/core';


@Injectable()
export class OnlineStatusService {
    constructor() {
    }

    addOnlineStateEventListener(listener) {
        window.addEventListener('offline', listener);
        window.addEventListener('online', listener);
    }
    
    removeOnlineStateEventListener(listener) {
        window.removeEventListener('offline', listener);
        window.removeEventListener('online', listener);
    }
}
