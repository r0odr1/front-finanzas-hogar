import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Household {
  id: string;
  name: string;
  createdAt: string;
  members: {
    id: string;
    displayName: string;
    role: 'OWNER' | 'MEMBER';
  }[];
}

interface HouseholdsResponse {
  households: Household[];
}

@Injectable({
  providedIn: 'root',
})
export class HouseholdService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getHouseholds(): Observable<HouseholdsResponse> {
    return this.http.get<HouseholdsResponse>(`${this.apiUrl}/households`);
  }
}