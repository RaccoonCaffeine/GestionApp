import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner, IonButtons, IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterByIdsPipe } from './filter-by-ids.pipe';
import { FilterMovsByItemsPipe } from './filter-movs-by-items.pipe';
import { FilterMovsByFechaPipe } from './filter-movs-by-fecha.pipe';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner, IonButtons, IonButton, IonIcon,
    IonSelect, IonSelectOption,
    CommonModule, NgFor, NgIf, FormsModule,
    FilterByIdsPipe, FilterMovsByItemsPipe, FilterMovsByFechaPipe
  ]
})
export class ReportesPage implements OnInit {
  inventario: any[] = [];
  movimientos: any[] = [];
  loading = false;
  selectedItems: string[] = [];
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private reportService: ReportService) {}

  goBack() {
    window.history.back();
  }

  async ngOnInit() {
    this.loading = true;
    this.inventario = await this.reportService.getInventoryReport();
    // Asociar nombre de item a cada movimiento
    const movs = await this.reportService.getMovementsReport();
    this.movimientos = movs.map(mov => {
      const m: any = mov;
      const itemId = m.itemId || m.item || m.id;
      return {
        ...mov,
        itemName: this.inventario.find(i => i.id === itemId)?.description || itemId
      };
    });
    // Por defecto: primer y último día del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.fechaInicio = firstDay.toISOString().substring(0, 10);
    this.fechaFin = lastDay.toISOString().substring(0, 10);
    this.loading = false;
  }
}
