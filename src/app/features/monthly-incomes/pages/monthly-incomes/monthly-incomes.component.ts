import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
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
  MonthlyIncome,
  MonthlyIncomeService,
} from '../../../../core/services/monthly-income.service';

@Component({
  selector: 'app-monthly-incomes',
  templateUrl: './monthly-incomes.component.html',
  styleUrls: ['./monthly-incomes.component.scss'],
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
export class MonthlyIncomesComponent {
  private readonly householdService = inject(HouseholdService);
  private readonly movementService = inject(MovementService);
  private readonly monthlyIncomeService = inject(MonthlyIncomeService);

  catalogs = signal<MovementCatalogsResponse | null>(null);
  incomes = signal<MonthlyIncome[]>([]);
  total = signal(0);

  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  householdId = '';

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
  memberId = '';
  accountId = '';
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

            if (catalogs.members.length > 0) {
              this.memberId = catalogs.members[0].id;
            }

            if (catalogs.accounts.length > 0) {
              this.accountId = catalogs.accounts[0].id;
            }

            this.loadMonthlyIncomes();
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

  loadMonthlyIncomes(): void {
    if (!this.householdId) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.monthlyIncomeService
      .getMonthlyIncomes(
        this.householdId,
        this.currentYear,
        this.selectedMonth,
      )
      .subscribe({
        next: (response) => {
          this.incomes.set(response.incomes);
          this.total.set(response.total);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error consultando ingresos mensuales:', error);
          this.error.set('No fue posible consultar los ingresos mensuales.');
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

    if (!this.memberId) {
      this.error.set('Debes seleccionar una persona.');
      return;
    }

    if (!this.accountId) {
      this.error.set('Debes seleccionar una cuenta.');
      return;
    }

    if (!this.amount || this.amount <= 0) {
      this.error.set('Debes indicar un valor válido.');
      return;
    }

    this.saving.set(true);

    this.monthlyIncomeService
      .saveMonthlyIncome(this.householdId, {
        memberId: this.memberId,
        accountId: this.accountId,
        year: this.currentYear,
        month: this.selectedMonth,
        amount: this.amount,
      })
      .subscribe({
        next: (response) => {
          this.success.set(response.message);
          this.saving.set(false);
          this.amount = null;
          this.loadMonthlyIncomes();
        },
        error: (error) => {
          console.error('Error guardando ingreso mensual:', error);
          this.error.set(
            error?.error?.message ||
              'No fue posible guardar el ingreso mensual.',
          );
          this.saving.set(false);
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
}