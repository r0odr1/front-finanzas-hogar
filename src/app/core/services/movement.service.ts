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

export interface MovementCatalogItem {
  id: string;
  name?: string;
  displayName?: string;
}

export interface MovementCatalogsResponse {
  members: {
    id: string;
    displayName: string;
  }[];
  accounts: {
    id: string;
    name: string;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
}

export interface CreateMovementPayload {
  memberId: string;
  accountId: string;
  categoryId: string | null;
  type: 'EXPENSE' | 'INCOME';
  amount: number;
  description: string;
  occurredAt: string;
}

interface CreateMovementResponse {
  message: string;
  movement: Movement;
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

  getCatalogs(householdId: string): Observable<MovementCatalogsResponse> {
  return this.http.get<MovementCatalogsResponse>(
    `${this.apiUrl}/catalogs/${householdId}/movements`,
  );
}

createMovement(
  householdId: string,
  payload: CreateMovementPayload,
): Observable<CreateMovementResponse> {
    return this.http.post<CreateMovementResponse>(
      `${this.apiUrl}/movements/${householdId}`,
      payload,
    );
  }
}