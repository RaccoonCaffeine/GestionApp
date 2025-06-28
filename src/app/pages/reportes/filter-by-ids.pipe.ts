import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterByIds', standalone: true })
export class FilterByIdsPipe implements PipeTransform {
  transform(items: any[], ids: string[]): any[] {
    if (!ids || ids.length === 0) return items;
    return items.filter(item => ids.includes(item.id));
  }
}
