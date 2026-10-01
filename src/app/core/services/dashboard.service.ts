import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MonthlySummary {
  household: {
    id: string;
    name: string;
  };
  period: {
    year: number;
    month: number;
  };
  income: {
    base: number;
    extra: number;
    total: number;
  };
  expenses: {
    total: number;
  };
  balance: {
    total: number;
  };
  usagePercentage: number;

  members: {
    id: string;
    displayName: string;
    income: {
      base: number;
      extra: number;
      total: number;
    };
    expenses: {
      total: number;
    };
    balance: {
      total: number;
    };
  }[];

  topCategories: {
    id: string;
    name: string;
    total: number;
  }[];
}

interface MonthlySummaryResponse {
  summary: MonthlySummary;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMonthlySummary(householdId: string, year: number, month: number): Observable<MonthlySummaryResponse> {
    return this.http.get<MonthlySummaryResponse>(
      `${this.apiUrl}/dashboard/${householdId}/monthly?year=${year}&month=${month}`,
    );
  }
}