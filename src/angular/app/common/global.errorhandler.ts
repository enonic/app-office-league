import {ErrorHandler, Injectable} from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    handleError(error) {
        console.error('Global error handler showing toast for: ' + error.toString());

        Materialize.toast(`<i class="material-icons">error_outline</i><p>${error.toString()}</p>`, 10000, 'error');

        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        //throw error;
    }

}