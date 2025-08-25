import { Pipe, PipeTransform } from '@angular/core';
import { es } from 'date-fns/locale';
import { formatDistanceToNow, formatDistance } from 'date-fns';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(
    value: string | Date,
    formatType: 'fromNow' | 'untilNow' = 'fromNow'
  ): unknown {
    if (!value) return 'Fecha no válida';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Fecha inválida';

    return formatType === 'fromNow'
      ? formatDistanceToNow(date, { addSuffix: true, locale: es })
      : formatDistance(date, new Date(), { addSuffix: true, locale: es });
  }
}
