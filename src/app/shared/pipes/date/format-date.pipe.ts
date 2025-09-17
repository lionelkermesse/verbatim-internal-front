import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs/esm';

@Pipe({
  standalone: true,
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(day: dayjs.Dayjs | string | null | undefined, format = 'DD/MM/YYYY HH:mm:ss'): string {
    if (typeof day === 'string') {
      return dayjs(day).format(format);
    } else if (dayjs.isDayjs(day)) {
      return day.format(format);
    } else {
      return '';
    }
  }
}
