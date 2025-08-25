// src/app/shared/pipes/format-cop.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { formatCop } from '../utilities/currency.utilities.service';

@Pipe({ name: 'formatCop', standalone: true })
export class FormatCopPipe implements PipeTransform {
  transform(value: string | number): string {
    return formatCop(value);
  }
}
