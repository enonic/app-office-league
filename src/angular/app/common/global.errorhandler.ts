import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private snackBar: MatSnackBar) {}

    handleError(error) {
        console.error('Global error handler showing toast for: ' + error?.toString(), error);

        // Using Angular Material SnackBar instead of Materialize toast
        this.snackBar.open('Oops! Something went wrong!', 'Error', {
            duration: 3000,
            panelClass: ['mat-toolbar', 'mat-warn']
        });

        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        //throw error;
    }
}
