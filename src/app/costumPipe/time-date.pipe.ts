import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDate',
  standalone:true
})
export class TimeDatePipe implements PipeTransform {
  transform(value: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    const hungaryTime = new Date(value.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }));
    const date = hungaryTime.toLocaleDateString('hu-HU', options);

    return `Idő ma Szeged: ${date}`;
  }
}