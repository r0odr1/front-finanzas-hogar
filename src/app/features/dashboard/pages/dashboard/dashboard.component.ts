import { Component, OnInit, inject, signal } from '@angular/core';
import { DashboardService, MonthlySummary } from '../../../../core/services/dashboard.service';
import { HouseholdService } from '../../../../core/services/household.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [],
})
export class DashboardComponent implements OnInit {
  private readonly householdService = inject(HouseholdService);
  private readonly dashboardService = inject(DashboardService);

  summary = signal<MonthlySummary | null>(null);
  loading = signal(true);
  error = signal('');
  noHousehold = signal(false);

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
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

        this.dashboardService.getMonthlySummary(household.id, year, month).subscribe({
          next: (dashboardResponse) => {
            this.summary.set(dashboardResponse.summary);
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error consultando el resumen financiero:', error);
            this.error.set('No fue posible consultar el resumen financiero.');
            this.loading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Error consultando los hogares:', error);
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
}