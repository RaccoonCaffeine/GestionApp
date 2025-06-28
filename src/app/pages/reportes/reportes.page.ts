import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner, IonButtons, IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterByIdsPipe } from './filter-by-ids.pipe';
import { FilterMovsByItemsPipe } from './filter-movs-by-items.pipe';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner, IonButtons, IonButton, IonIcon,
    IonSelect, IonSelectOption,
    CommonModule, NgFor, NgIf, FormsModule,
    FilterByIdsPipe, FilterMovsByItemsPipe
  ]
})
export class ReportesPage implements OnInit {
  inventario: any[] = [];
  movimientos: any[] = [];
  loading = false;
  selectedItems: string[] = [];

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
    this.loading = false;
  }
}
