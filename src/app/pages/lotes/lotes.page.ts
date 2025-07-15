import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-lotes',
  templateUrl: './lotes.page.html',
  styleUrls: ['./lotes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent,
    DatePipe, CurrencyPipe
  ]
})
export class LotesPage implements OnInit {
  item: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Recibe el item por navigation extras (state)
    const nav = this.router.getCurrentNavigation();
    this.item = nav?.extras?.state?.['item'];
  }

  goBack() {
    this.router.navigate(['/inventario']);
  }

  editBatch(batch: any) {
    // Implementar lógica de edición de lote
  }

  deleteBatch(batch: any) {
    // Implementar lógica de eliminación de lote
  }
}
