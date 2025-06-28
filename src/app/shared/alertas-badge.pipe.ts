import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'alertasBadge', standalone: true })
export class AlertasBadgePipe implements PipeTransform {
  transform(alertas: any[]): number {
    return alertas.filter(a => !a.leida).length;
  }
}
