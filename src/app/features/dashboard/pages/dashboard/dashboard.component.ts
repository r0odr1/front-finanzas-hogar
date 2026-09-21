import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService, HealthResponse } from '../../../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [],
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  health = signal<HealthResponse | null>(null);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.checkApi();
  }

  private checkApi(): void {
    this.apiService.health().subscribe({
      next: (response) => {
        this.health.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error conectando con la API:', error);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}