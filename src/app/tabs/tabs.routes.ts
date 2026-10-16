import { authGuard } from '../core/guards/auth.guard';
import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../features/dashboard/pages/dashboard/dashboard.component')
            .then((m) => m.DashboardComponent),
      },
      {
        path: 'movements',
        loadComponent: () =>
          import('../features/movements/pages/movements/movements.component')
            .then((m) => m.MovementsComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('../features/movements/pages/register-movement/register-movement.component')
            .then((m) => m.RegisterMovementComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('../features/reports/pages/reports/reports.component')
            .then((m) => m.ReportsComponent),
      },
      {
        path: 'more',
        loadComponent: () =>
          import('../features/more/pages/more/more.component')
            .then((m) => m.MoreComponent),
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'monthly-incomes',
        loadComponent: () =>
          import('../features/monthly-incomes/pages/monthly-incomes/monthly-incomes.component')
            .then((m) => m.MonthlyIncomesComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('../features/categories/pages/categories/categories.component')
            .then((m) => m.CategoriesComponent),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full',
  },
];