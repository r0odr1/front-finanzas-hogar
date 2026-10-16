import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MonthlyIncome {
  id: string;
  year: number;
  month: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    displayName: string;
  };
  account: {
    id: string;
    name: string;
  };
}

interface MonthlyIncomesResponse {
  incomes: MonthlyIncome[];
  total: number;
}

export interface SaveMonthlyIncomePayload {
  memberId: string;
  accountId: string;
  year: number;
  month: number;
  amount: number;
}

interface SaveMonthlyIncomeResponse {
  message: string;
  income: MonthlyIncome & {
    created: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MonthlyIncomeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMonthlyIncomes(
    householdId: string,
    year: number,
    month: number,
  ): Observable<MonthlyIncomesResponse> {
    const params = new HttpParams()
      .set('year', year)
      .set('month', month);

    return this.http.get<MonthlyIncomesResponse>(
      `${this.apiUrl}/monthly-incomes/${householdId}`,
      { params },
    );
  }

  saveMonthlyIncome(
    householdId: string,
    payload: SaveMonthlyIncomePayload,
  ): Observable<SaveMonthlyIncomeResponse> {
    return this.http.put<SaveMonthlyIncomeResponse>(
      `${this.apiUrl}/monthly-incomes/${householdId}`,
      payload,
    );
  }
}