import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
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
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full',
  },
];