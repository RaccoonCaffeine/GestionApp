import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterMovsByItems', standalone: true })
export class FilterMovsByItemsPipe implements PipeTransform {
  transform(movs: any[], ids: string[]): any[] {
    if (!ids || ids.length === 0) return movs;
    return movs.filter(mov => ids.includes(mov.itemId));
  }
}
