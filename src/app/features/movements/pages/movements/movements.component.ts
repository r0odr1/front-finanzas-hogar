import { Component, OnInit, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { HouseholdService } from '../../../../core/services/household.service';
import { Movement, MovementService } from '../../../../core/services/movement.service';

@Component({
  selector: 'app-movements',
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.scss'],
  imports: [IonContent],
})
export class MovementsComponent implements OnInit {
  private readonly householdService = inject(HouseholdService);
  private readonly movementService = inject(MovementService);

  movements = signal<Movement[]>([]);
  loading = signal(true);
  error = signal('');
  noHousehold = signal(false);

  ngOnInit(): void {
    this.loadMovements();
  }

  private loadMovements(): void {
    this.loading.set(true);
    this.error.set('');
    this.noHousehold.set(false);

    this.householdService.getHouseholds().subscribe({
      next: (response) => {
        const household = response.households[0];

        if (!household) {
          this.noHousehold.set(true);
          this.loading.set(false);
          return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        this.movementService.getMovements(household.id, year, month).subscribe({
          next: (response) => {
            this.movements.set(response.movements);
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error consultando movimientos:', error);
            this.error.set('No fue posible consultar los movimientos.');
            this.loading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Error consultando el hogar:', error);
        this.error.set('No fue posible consultar el hogar.');
        this.loading.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(value));
  }
}