import {ErrorHandler, Injectable} from '@angular/core';
import {toast} from 'materialize-css';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    handleError(error) {
        console.error('Global error handler showing toast for: ' + error.toString());

        toast({ html: `<i class="material-icons">error_outline</i><p>Oops! Something went wrong!</p>`, displayLength: 3000, classes: 'error'});

        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        //throw error;
    }

}