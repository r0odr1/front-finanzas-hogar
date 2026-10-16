import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface MovementFilters {
  type?: 'EXPENSE' | 'INCOME';
  memberId?: string;
  accountId?: string;
  categoryId?: string;
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

export interface UpdateMovementPayload {
  memberId: string;
  accountId: string;
  categoryId: string | null;
  type: 'EXPENSE' | 'INCOME';
  amount: number;
  description: string;
  occurredAt: string;
}

interface UpdateMovementResponse {
  message: string;
  movement: Movement;
}

interface DeleteMovementResponse {
  message: string;
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

  getMovements(householdId: string, year: number, month: number, filters: MovementFilters = {},):Observable<MovementsResponse> {
    let params = new HttpParams()
      .set('year', year)
      .set('month', month);

    if (filters.type) {
      params = params.set('type', filters.type);
    }

    if (filters.memberId) {
      params = params.set('memberId', filters.memberId);
    }

    if (filters.accountId) {
      params = params.set('accountId', filters.accountId);
    }

    if (filters.categoryId) {
      params = params.set('categoryId', filters.categoryId);
    }

    return this.http.get<MovementsResponse>(
      `${this.apiUrl}/movements/${householdId}`,
      { params },
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

  updateMovement(
    householdId: string,
    movementId: string,
    payload: UpdateMovementPayload,
  ): Observable<UpdateMovementResponse> {
    return this.http.patch<UpdateMovementResponse>(
      `${this.apiUrl}/movements/${householdId}/${movementId}`,
      payload,
    );
  }

  deleteMovement(
    householdId: string,
    movementId: string,
  ): Observable<DeleteMovementResponse> {
    return this.http.delete<DeleteMovementResponse>(
      `${this.apiUrl}/movements/${householdId}/${movementId}`,
    );
  }
}