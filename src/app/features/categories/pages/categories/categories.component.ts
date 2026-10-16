import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
} from '@ionic/angular';
import { HouseholdService } from '../../../../core/services/household.service';
import {
  Category,
  CategoryService,
} from '../../../../core/services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
  ],
})
export class CategoriesComponent {
  private readonly householdService = inject(HouseholdService);
  private readonly categoryService = inject(CategoryService);
  private readonly alertController = inject(AlertController);

  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  householdId = '';
  name = '';
  editingCategoryId = '';

  ionViewWillEnter(): void {
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
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error consultando hogar:', error);
        this.error.set('No fue posible consultar el hogar.');
        this.loading.set(false);
      },
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories(this.householdId).subscribe({
      next: (response) => {
        this.categories.set(response.categories);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error consultando categorías:', error);
        this.error.set('No fue posible consultar las categorías.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    this.error.set('');
    this.success.set('');

    if (!this.name.trim()) {
      this.error.set('Debes indicar un nombre.');
      return;
    }

    this.saving.set(true);

    if (this.editingCategoryId) {
      this.categoryService
        .updateCategory(
          this.householdId,
          this.editingCategoryId,
          this.name.trim(),
        )
        .subscribe({
          next: (response) => {
            this.success.set(response.message);
            this.resetForm();
            this.loadCategories();
            this.saving.set(false);
          },
          error: (error) => {
            console.error('Error actualizando categoría:', error);
            this.error.set(
              error?.error?.message ||
                'No fue posible actualizar la categoría.',
            );
            this.saving.set(false);
          },
        });

      return;
    }

    this.categoryService
      .createCategory(this.householdId, this.name.trim())
      .subscribe({
        next: (response) => {
          this.success.set(response.message);
          this.resetForm();
          this.loadCategories();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error creando categoría:', error);
          this.error.set(
            error?.error?.message ||
              'No fue posible crear la categoría.',
          );
          this.saving.set(false);
        },
      });
  }

  edit(category: Category): void {
    this.editingCategoryId = category.id;
    this.name = category.name;
    this.error.set('');
    this.success.set('');
  }

  cancelEdit(): void {
    this.resetForm();
  }

  async confirmDelete(category: Category): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar categoría',
      message: `¿Seguro que deseas eliminar "${category.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.delete(category);
          },
        },
      ],
    });

    await alert.present();
  }

  private delete(category: Category): void {
    this.categoryService
      .deleteCategory(this.householdId, category.id)
      .subscribe({
        next: (response) => {
          this.success.set(response.message);

          this.categories.update((categories) =>
            categories.filter((item) => item.id !== category.id),
          );

          if (this.editingCategoryId === category.id) {
            this.resetForm();
          }
        },
        error: (error) => {
          console.error('Error eliminando categoría:', error);
          this.error.set(
            error?.error?.message ||
              'No fue posible eliminar la categoría.',
          );
        },
      });
  }

  private resetForm(): void {
    this.name = '';
    this.editingCategoryId = '';
  }
}