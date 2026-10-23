import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment';

// replaces angular2-moment's amCalendar: {{ date | amCalendar:formats }}
@Pipe({name: 'amCalendar', standalone: false})
export class CalendarPipe implements PipeTransform {

    transform(value: Date | string | number, formats?: moment.CalendarSpec): string {
        return value ? moment(value).calendar(null, formats) : '';
    }
}
