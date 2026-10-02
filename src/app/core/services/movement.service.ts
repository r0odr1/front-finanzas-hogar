import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Movement {
  id: string;
  type: 'EXPENSE' | 'INCOME';
  source: 'APP' | 'TELEGRAM' | 'MIGRATION';
  amount: number;
  description: string;
  occurredAt: string;
  createdAt: string;
  member: {
    id: string;
    displayName: string;
  };
  account: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  } | null;
}

interface MovementsResponse {
  movements: Movement[];
}

@Injectable({
  providedIn: 'root',
})
export class MovementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMovements(householdId: string, year: number, month: number): Observable<MovementsResponse> {
    return this.http.get<MovementsResponse>(
      `${this.apiUrl}/movements/${householdId}?year=${year}&month=${month}`,
    );
  }
}