import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular';
import { HouseholdService } from '../../../../core/services/household.service';
import {
  MovementCatalogsResponse,
  MovementService,
} from '../../../../core/services/movement.service';
import {
  Budget,
  BudgetService,
} from '../../../../core/services/budget.service';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
  ],
})
export class BudgetsComponent {
  private readonly householdService = inject(HouseholdService);
  private readonly movementService = inject(MovementService);
  private readonly budgetService = inject(BudgetService);
  private readonly alertController = inject(AlertController);

  catalogs = signal<MovementCatalogsResponse | null>(null);
  budgets = signal<Budget[]>([]);
  total = signal(0);

  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  householdId = '';
  editingBudgetId = '';

  readonly currentYear = new Date().getFullYear();

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

  selectedMonth = new Date().getMonth() + 1;
  scope: 'HOUSEHOLD' | 'MEMBER' = 'HOUSEHOLD';
  memberId = '';
  categoryId = '';
  amount: number | null = null;

  ionViewWillEnter(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.householdService.getHouseholds().subscribe({
      next: (response) => {
        const household = response.households[0];

        if (!household) {
          this.error.set('No tienes un hogar configurado.');
          this.loading.set(false);
          return;
        }

        this.householdId = household.id;

        this.movementService.getCatalogs(household.id).subscribe({
          next: (catalogs) => {
            this.catalogs.set(catalogs);

            this.memberId = catalogs.members[0]?.id ?? '';
            this.categoryId = catalogs.categories[0]?.id ?? '';

            this.loadBudgets();
          },
          error: (error) => {
            console.error('Error consultando catálogos:', error);
            this.error.set('No fue posible cargar los datos.');
            this.loading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Error consultando hogar:', error);
        this.error.set('No fue posible consultar el hogar.');
        this.loading.set(false);
      },
    });
  }

  loadBudgets(): void {
    if (!this.householdId) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.budgetService
      .getBudgets(
        this.householdId,
        this.currentYear,
        this.selectedMonth,
      )
      .subscribe({
        next: (response) => {
          this.budgets.set(response.budgets);
          this.total.set(response.total);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error consultando presupuestos:', error);
          this.error.set('No fue posible consultar los presupuestos.');
          this.loading.set(false);
        },
      });
  }

  save(): void {
    this.error.set('');
    this.success.set('');

    if (!this.householdId) {
      this.error.set('No se encontró el hogar.');
      return;
    }

    if (!this.categoryId) {
      this.error.set('Debes seleccionar una categoría.');
      return;
    }

    if (this.scope === 'MEMBER' && !this.memberId) {
      this.error.set('Debes seleccionar una persona.');
      return;
    }

    if (!this.amount || this.amount <= 0) {
      this.error.set('Debes indicar un valor válido.');
      return;
    }

    this.saving.set(true);

    if (this.editingBudgetId) {
      this.budgetService
        .updateBudget(
          this.householdId,
          this.editingBudgetId,
          {
            memberId:
              this.scope === 'MEMBER'
                ? this.memberId
                : null,
            categoryId: this.categoryId,
            scope: this.scope,
            amount: this.amount,
          },
        )
        .subscribe({
          next: (response) => {
            this.success.set(response.message);
            this.resetForm();
            this.loadBudgets();
            this.saving.set(false);
          },
          error: (error) => {
            console.error('Error actualizando presupuesto:', error);
            this.error.set(
              error?.error?.message ||
                'No fue posible actualizar el presupuesto.',
            );
            this.saving.set(false);
          },
        });

      return;
    }

    this.budgetService
      .createBudget(
        this.householdId,
        {
          memberId:
            this.scope === 'MEMBER'
              ? this.memberId
              : null,
          categoryId: this.categoryId,
          scope: this.scope,
          year: this.currentYear,
          month: this.selectedMonth,
          amount: this.amount,
        },
      )
      .subscribe({
        next: (response) => {
          this.success.set(response.message);
          this.resetForm();
          this.loadBudgets();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error creando presupuesto:', error);
          this.error.set(
            error?.error?.message ||
              'No fue posible crear el presupuesto.',
          );
          this.saving.set(false);
        },
      });
  }

  edit(budget: Budget): void {
    this.editingBudgetId = budget.id;
    this.scope = budget.scope;
    this.memberId = budget.member?.id ?? '';
    this.categoryId = budget.category.id;
    this.amount = budget.amount;

    this.error.set('');
    this.success.set('');
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async confirmDelete(budget: Budget): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar presupuesto',
      message: `¿Seguro que deseas eliminar el presupuesto de "${budget.category.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.delete(budget);
          },
        },
      ],
    });

    await alert.present();
  }

  private delete(budget: Budget): void {
    this.budgetService
      .deleteBudget(this.householdId, budget.id)
      .subscribe({
        next: (response) => {
          this.success.set(response.message);

          if (this.editingBudgetId === budget.id) {
            this.resetForm();
          }

          this.loadBudgets();
        },
        error: (error) => {
          console.error('Error eliminando presupuesto:', error);
          this.error.set(
            error?.error?.message ||
              'No fue posible eliminar el presupuesto.',
          );
        },
      });
  }

  private resetForm(): void {
    this.editingBudgetId = '';
    this.scope = 'HOUSEHOLD';
    this.memberId = this.catalogs()?.members[0]?.id ?? '';
    this.categoryId = this.catalogs()?.categories[0]?.id ?? '';
    this.amount = null;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }
}