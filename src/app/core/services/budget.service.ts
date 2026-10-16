import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Budget {
  id: string;
  scope: 'HOUSEHOLD' | 'MEMBER';
  year: number;
  month: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  member: {
    id: string;
    displayName: string;
  } | null;
}

interface BudgetsResponse {
  budgets: Budget[];
  total: number;
}

export interface CreateBudgetPayload {
  memberId: string | null;
  categoryId: string;
  scope: 'HOUSEHOLD' | 'MEMBER';
  year: number;
  month: number;
  amount: number;
}

export interface UpdateBudgetPayload {
  memberId: string | null;
  categoryId: string;
  scope: 'HOUSEHOLD' | 'MEMBER';
  amount: number;
}

interface BudgetResponse {
  message: string;
  budget: Budget;
}

interface DeleteBudgetResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getBudgets(
    householdId: string,
    year: number,
    month: number,
  ): Observable<BudgetsResponse> {
    const params = new HttpParams()
      .set('year', year)
      .set('month', month);

    return this.http.get<BudgetsResponse>(
      `${this.apiUrl}/budgets/${householdId}`,
      { params },
    );
  }

  createBudget(
    householdId: string,
    payload: CreateBudgetPayload,
  ): Observable<BudgetResponse> {
    return this.http.post<BudgetResponse>(
      `${this.apiUrl}/budgets/${householdId}`,
      payload,
    );
  }

  updateBudget(
    householdId: string,
    budgetId: string,
    payload: UpdateBudgetPayload,
  ): Observable<BudgetResponse> {
    return this.http.patch<BudgetResponse>(
      `${this.apiUrl}/budgets/${householdId}/${budgetId}`,
      payload,
    );
  }

  deleteBudget(
    householdId: string,
    budgetId: string,
  ): Observable<DeleteBudgetResponse> {
    return this.http.delete<DeleteBudgetResponse>(
      `${this.apiUrl}/budgets/${householdId}/${budgetId}`,
    );
  }
}