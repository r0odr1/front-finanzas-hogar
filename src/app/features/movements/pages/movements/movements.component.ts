import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular';
import { HouseholdService } from '../../../../core/services/household.service';
import { Movement, MovementCatalogsResponse, MovementService } from '../../../../core/services/movement.service';

@Component({
  selector: 'app-movements',
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
  ],
})
export class MovementsComponent {
  private readonly householdService = inject(HouseholdService);
  private readonly movementService = inject(MovementService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);

  movements = signal<Movement[]>([]);
  loading = signal(true);
  error = signal('');
  noHousehold = signal(false);

  catalogs = signal<MovementCatalogsResponse | null>(null);

  readonly months = [
    { value: 1, name: 'Enero' },
    { value: 2, name: 'Febrero' },
    { value: 3, name: 'Marzo' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Mayo' },
    { value: 6, name: 'Junio' },
    { value: 7, name: 'Julio' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Septiembre' },
    { value: 10, name: 'Octubre' },
    { value: 11, name: 'Noviembre' },
    { value: 12, name: 'Diciembre' },
  ];

  readonly currentYear = new Date().getFullYear();

  selectedMonth = new Date().getMonth() + 1;
  selectedType: '' | 'EXPENSE' | 'INCOME' = '';
  selectedMemberId = '';
  selectedAccountId = '';
  selectedCategoryId = '';

  householdId = '';

  ionViewWillEnter(): void {
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

        this.householdId = household.id;

        this.movementService.getCatalogs(household.id).subscribe({
          next: (catalogs) => {
            this.catalogs.set(catalogs);
            this.loadFilteredMovements();
          },
          error: (error) => {
            console.error('Error consultando catálogos:', error);
            this.error.set('No fue posible cargar los filtros.');
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

  private loadFilteredMovements(): void {
    if (!this.householdId) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.movementService
      .getMovements(
        this.householdId,
        this.currentYear,
        this.selectedMonth,
        {
          type: this.selectedType || undefined,
          memberId: this.selectedMemberId || undefined,
          accountId: this.selectedAccountId || undefined,
          categoryId: this.selectedCategoryId || undefined,
        },
      )
      .subscribe({
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
  }

  applyFilters(): void {
    this.loadFilteredMovements();
  }

  clearFilters(): void {
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedType = '';
    this.selectedMemberId = '';
    this.selectedAccountId = '';
    this.selectedCategoryId = '';

    this.loadFilteredMovements();
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

  editMovement(movement: Movement): void {
    this.router.navigate(['/tabs/register'], {
      queryParams: {
        movementId: movement.id,
      },
    });
  }

  async confirmDelete(movement: Movement): Promise<void> {
  const alert = await this.alertController.create({
    header: 'Eliminar movimiento',
    message: `¿Seguro que deseas eliminar "${movement.description}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: () => {
          this.deleteMovement(movement);
        },
      },
    ],
  });

  await alert.present();
}

private deleteMovement(movement: Movement): void {
  if (!this.householdId) {
    this.error.set('No se encontró el hogar.');
    return;
  }

  this.movementService
    .deleteMovement(this.householdId, movement.id)
    .subscribe({
      next: () => {
        this.movements.update((movements) =>
          movements.filter((item) => item.id !== movement.id),
        );
      },
      error: (error) => {
        console.error('Error eliminando movimiento:', error);
        this.error.set(
          error?.error?.message ||
            'No fue posible eliminar el movimiento.',
        );
      },
    });
  }
}