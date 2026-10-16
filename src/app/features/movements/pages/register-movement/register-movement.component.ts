import { Component, inject, signal } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HouseholdService } from '../../../../core/services/household.service';
import {
  Movement,
  MovementCatalogsResponse,
  MovementService,
} from '../../../../core/services/movement.service';

@Component({
  selector: 'app-register-movement',
  templateUrl: './register-movement.component.html',
  styleUrls: ['./register-movement.component.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
  ],
})
export class RegisterMovementComponent {
  private readonly householdService = inject(HouseholdService);
  private readonly movementService = inject(MovementService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  catalogs = signal<MovementCatalogsResponse | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  householdId = '';
  memberId = '';
  accountId = '';
  categoryId = '';
  type: 'EXPENSE' | 'INCOME' = 'EXPENSE';
  amount: number | null = null;
  description = '';

  movementId = '';
  editing = false;
  originalOccurredAt = '';

  ionViewWillEnter(): void {
    this.movementId = this.route.snapshot.queryParamMap.get('movementId') ?? '';
    this.editing = !!this.movementId;
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.householdService.getHouseholds().subscribe({
      next: (response) => {
        const household = response.households[0];

        if (!household) {
          this.error.set('No tienes un hogar configurado.');
          this.loading.set(false);
          return;
        }

        this.householdId = household.id;

        this.movementService.getCatalogs(household.id).subscribe({
          next: (catalogs) => {
            this.catalogs.set(catalogs);

            if (this.editing) {
              this.loadMovement();
              return;
            }

            if (catalogs.members.length > 0) {
              this.memberId = catalogs.members[0].id;
            }

            if (catalogs.accounts.length > 0) {
              this.accountId = catalogs.accounts[0].id;
            }

            if (catalogs.categories.length > 0) {
              this.categoryId = catalogs.categories[0].id;
            }

            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error consultando catálogos:', error);
            this.error.set('No fue posible cargar los datos para registrar el movimiento.');
            this.loading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Error consultando hogar:', error);
        this.error.set('No fue posible consultar el hogar.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    this.error.set('');
    this.success.set('');

    if (!this.householdId) {
      this.error.set('No se encontró el hogar.');
      return;
    }

    if (!this.memberId) {
      this.error.set('Debes seleccionar una persona.');
      return;
    }

    if (!this.accountId) {
      this.error.set('Debes seleccionar una cuenta.');
      return;
    }

    if (!this.amount || this.amount <= 0) {
      this.error.set('Debes indicar un valor válido.');
      return;
    }

    if (!this.description.trim()) {
      this.error.set('Debes indicar una descripción.');
      return;
    }

    this.saving.set(true);

    const payload = {
      memberId: this.memberId,
      accountId: this.accountId,
      categoryId: this.categoryId || null,
      type: this.type,
      amount: this.amount,
      description: this.description.trim(),
      occurredAt: this.editing
        ? this.originalOccurredAt
        : new Date().toISOString(),
    };

    if (this.editing) {
      this.movementService
        .updateMovement(
          this.householdId,
          this.movementId,
          payload,
        )
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.router.navigate(['/tabs/movements']);
          },
          error: (error) => {
            console.error('Error actualizando movimiento:', error);
            this.error.set(
              error?.error?.message ||
                'No fue posible actualizar el movimiento.',
            );
            this.saving.set(false);
          },
        });

      return;
    }

    this.movementService
      .createMovement(
        this.householdId,
        payload,
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.resetForm();
          this.router.navigate(['/tabs/movements']);
        },
        error: (error) => {
          console.error('Error registrando movimiento:', error);
          this.error.set(
            error?.error?.message ||
              'No fue posible registrar el movimiento.',
          );
          this.saving.set(false);
        },
      });
  }

  private resetForm(): void {
    this.type = 'EXPENSE';
    this.amount = null;
    this.description = '';

    const catalogs = this.catalogs();

    this.memberId = catalogs?.members[0]?.id ?? '';
    this.accountId = catalogs?.accounts[0]?.id ?? '';
    this.categoryId = catalogs?.categories[0]?.id ?? '';
  }

  private loadMovement(): void {
  const now = new Date();

  this.movementService
    .getMovements(
      this.householdId,
      now.getFullYear(),
      now.getMonth() + 1,
    )
    .subscribe({
      next: (response) => {
        const movement = response.movements.find(
          (item) => item.id === this.movementId,
        );

        if (!movement) {
          this.error.set('No fue posible encontrar el movimiento.');
          this.loading.set(false);
          return;
        }

        this.fillForm(movement);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error consultando movimiento:', error);
        this.error.set('No fue posible cargar el movimiento.');
        this.loading.set(false);
      },
    });
  }

  private fillForm(movement: Movement): void {
    this.memberId = movement.member.id;
    this.accountId = movement.account.id;
    this.categoryId = movement.category?.id ?? '';
    this.type = movement.type;
    this.amount = movement.amount;
    this.description = movement.description;
    this.originalOccurredAt = movement.occurredAt;
  }
}