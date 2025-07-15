import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterMovsByFecha', standalone: true })
export class FilterMovsByFechaPipe implements PipeTransform {
  transform(movs: any[], fechaInicio: string, fechaFin: string): any[] {
    if (!fechaInicio && !fechaFin) return movs;
    const start = fechaInicio ? new Date(fechaInicio) : null;
    const end = fechaFin ? new Date(fechaFin) : null;
    return movs.filter(mov => {
      const movDate = new Date(mov.date);
      if (start && movDate < start) return false;
      if (end) {
        // Incluir todo el día de la fecha fin
        const endOfDay = new Date(end);
        endOfDay.setHours(23,59,59,999);
        if (movDate > endOfDay) return false;
      }
      return true;
    });
  }
}
