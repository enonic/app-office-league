import {ErrorHandler, Injectable} from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    handleError(error) {
        console.error('Global error handler showing toast for: ' + error?.toString(), error);
        M.toast({
            html:`<i class="material-icons">error_outline</i><p>Oops! Something went wrong!</p>`,
            inDuration: 3000,
        });

        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        //throw error;
    }

}