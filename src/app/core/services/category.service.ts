import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  categories: Category[];
}

interface CategoryResponse {
  message: string;
  category: Category;
}

interface DeleteCategoryResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getCategories(householdId: string): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/categories/${householdId}`,
    );
  }

  createCategory(
    householdId: string,
    name: string,
  ): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(
      `${this.apiUrl}/categories/${householdId}`,
      { name },
    );
  }

  updateCategory(
    householdId: string,
    categoryId: string,
    name: string,
  ): Observable<CategoryResponse> {
    return this.http.patch<CategoryResponse>(
      `${this.apiUrl}/categories/${householdId}/${categoryId}`,
      { name },
    );
  }

  deleteCategory(
    householdId: string,
    categoryId: string,
  ): Observable<DeleteCategoryResponse> {
    return this.http.delete<DeleteCategoryResponse>(
      `${this.apiUrl}/categories/${householdId}/${categoryId}`,
    );
  }
}