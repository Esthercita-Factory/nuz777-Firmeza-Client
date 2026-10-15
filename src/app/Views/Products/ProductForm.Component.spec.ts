import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ProductCategory, PRESET_CATEGORIES, ProductFormComponent } from './ProductForm.Component';

describe('ProductFormComponent - Categorías Enum y Personalizadas', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('contiene las 9 categorías predefinidas en el enum ProductCategory', () => {
    expect(PRESET_CATEGORIES.length).toBe(9);
    expect(PRESET_CATEGORIES).toContain(ProductCategory.Cementos);
    expect(PRESET_CATEGORIES).toContain(ProductCategory.Aceros);
    expect(PRESET_CATEGORIES).toContain(ProductCategory.Mamposteria);
    expect(PRESET_CATEGORIES).toContain(ProductCategory.Tuberias);
    expect(PRESET_CATEGORIES).toContain(ProductCategory.Herramientas);
    expect(PRESET_CATEGORIES).toContain(ProductCategory.Acabados);
    expect(PRESET_CATEGORIES).toContain(ProductCategory.Electricos);
    expect(PRESET_CATEGORIES).toContain(ProductCategory.Agregados);
    expect(PRESET_CATEGORIES).toContain(ProductCategory.Madera);
  });

  it('permite seleccionar una categoría predefinida del enum', () => {
    fixture.detectChanges();

    const vm = component as unknown as {
      onCategoryOptionChange(val: string): void;
      form: { category: string };
      isCustomCategory: boolean;
    };

    vm.onCategoryOptionChange(ProductCategory.Aceros);

    expect(vm.form.category).toBe(ProductCategory.Aceros);
    expect(vm.isCustomCategory).toBe(false);
  });

  it('al elegir "+ Otra categoría", activa el modo personalizado y toma el texto escrito', () => {
    fixture.detectChanges();

    const vm = component as unknown as {
      onCategoryOptionChange(val: string): void;
      onCustomCategoryInput(val: string): void;
      form: { category: string };
      isCustomCategory: boolean;
      customCategoryName: string;
    };

    vm.onCategoryOptionChange('__custom__');
    expect(vm.isCustomCategory).toBe(true);

    vm.onCustomCategoryInput('Impermeabilizantes');
    expect(vm.form.category).toBe('Impermeabilizantes');
    expect(vm.customCategoryName).toBe('Impermeabilizantes');
  });

  it('permite seleccionar categorías rápidamente mediante los botones/chips', () => {
    fixture.detectChanges();

    const vm = component as unknown as {
      selectPresetCategory(cat: ProductCategory): void;
      form: { category: string };
      selectedCategoryOption: string;
      isCustomCategory: boolean;
    };

    vm.selectPresetCategory(ProductCategory.Tuberias);
    expect(vm.form.category).toBe(ProductCategory.Tuberias);
    expect(vm.selectedCategoryOption).toBe(ProductCategory.Tuberias);
    expect(vm.isCustomCategory).toBe(false);
  });

  it('sincroniza automáticamente una categoría personalizada cargada en el producto', () => {
    const vm = component as unknown as {
      form: { category: string };
      syncCategoryState(): void;
      selectedCategoryOption: string;
      isCustomCategory: boolean;
      customCategoryName: string;
    };

    vm.form.category = 'Ferretería Liviana';
    vm.syncCategoryState();

    expect(vm.selectedCategoryOption).toBe('__custom__');
    expect(vm.isCustomCategory).toBe(true);
    expect(vm.customCategoryName).toBe('Ferretería Liviana');
  });

  it('sincroniza automáticamente una categoría estándar existente', () => {
    const vm = component as unknown as {
      form: { category: string };
      syncCategoryState(): void;
      selectedCategoryOption: string;
      isCustomCategory: boolean;
    };

    vm.form.category = 'Cementos';
    vm.syncCategoryState();

    expect(vm.selectedCategoryOption).toBe(ProductCategory.Cementos);
    expect(vm.isCustomCategory).toBe(false);
  });
});
