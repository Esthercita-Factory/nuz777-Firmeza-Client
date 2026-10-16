import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { ShopComponent } from './Shop.Component';
import { ProductsService, Product } from '../../Services/products.service';
import { CartService } from '../../Services/cart.service';
import { ToastService } from '../../Services/imports.service';
import { AdminNotificationService } from '../../Services/admin-notification.service';
import { AuthService } from '../../Services/auth.service';
import { provideRouter } from '@angular/router';

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;
  let cart: CartService;
  let toast: ToastService;

  const mockProduct: Product = {
    id: 'p1',
    sku: 'CEM-001',
    name: 'Cemento Gris Tipo 1',
    description: 'Cemento estructural',
    category: 'Cementos',
    unit: 'Bulto',
    price: 32500,
    stock: 50,
    isActive: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: null
  };

  beforeEach(async () => {
    localStorage.clear();

    const mockProductsService = {
      list: () =>
        of({
          items: [mockProduct],
          page: 1,
          pageSize: 12,
          totalCount: 1,
          totalPages: 1
        })
    };

    const mockAuthService = {
      isCustomerPending: () => false,
      requiresProfileCompletion: () => false,
      isAuthenticated: () => false,
      me: () => of(null)
    };

    await TestBed.configureTestingModule({
      imports: [ShopComponent],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: mockProductsService },
        { provide: AuthService, useValue: mockAuthService },
        CartService,
        ToastService,
        AdminNotificationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopComponent);
    component = fixture.componentInstance;
    cart = TestBed.inject(CartService);
    toast = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('debe crear el componente y cargar productos', () => {
    expect(component).toBeTruthy();
    expect(component['products']().length).toBe(1);
  });

  it('asigna la imagen correcta según la categoría y material', () => {
    const cementoImg = component['getProductImage'](mockProduct);
    expect(cementoImg).toBe('img/products/cemento.jpg');

    const tuboImg = component['getProductImage']({
      ...mockProduct,
      sku: 'TUB-001',
      name: 'Tubo PVC 1/2 pulgada',
      description: 'Tubo de fontanería para agua fría',
      category: 'Tubería'
    });
    expect(tuboImg).toBe('img/products/tuberia.jpg');
  });

  it('permite escribir la cantidad directamente y la sincroniza con el carrito', () => {
    // Agregar 1 unidad inicialmente
    component['add'](mockProduct);
    expect(cart.quantityOf('p1')).toBe(1);

    // Simular escritura de 15 en el input numérico
    const inputElement = document.createElement('input');
    inputElement.value = '15';
    const inputEvent = { target: inputElement } as unknown as Event;

    component['onQuantityInput'](mockProduct, inputEvent);
    expect(cart.quantityOf('p1')).toBe(15);
  });

  it('limita la cantidad al stock disponible si el usuario escribe un número mayor', () => {
    component['add'](mockProduct);

    // Intentar escribir 999 cuando el stock es 50
    const inputElement = document.createElement('input');
    inputElement.value = '999';
    const inputEvent = { target: inputElement } as unknown as Event;

    component['onQuantityInput'](mockProduct, inputEvent);
    expect(cart.quantityOf('p1')).toBe(50);
    expect(inputElement.value).toBe('50');
  });

  it('en cambio o blur, si es 0 remueve el producto del carrito', () => {
    component['add'](mockProduct);
    expect(cart.quantityOf('p1')).toBe(1);

    const inputElement = document.createElement('input');
    inputElement.value = '0';
    const changeEvent = { target: inputElement } as unknown as Event;

    component['onQuantityChange'](mockProduct, changeEvent);
    expect(cart.quantityOf('p1')).toBe(0);
  });

  it('resuelve correctamente los tipos de categorías y degradados para las ilustraciones SVG', () => {
    expect(component['getCategoryType'](mockProduct)).toBe('cemento');
    expect(component['getCategoryGradient'](mockProduct)).toContain('slate-800');

    const tubo = {
      ...mockProduct,
      sku: 'TUB-001',
      name: 'Tubo Sanitario PVC 2"',
      category: 'Tuberías'
    };
    expect(component['getCategoryType'](tubo)).toBe('tuberia');
    expect(component['getCategoryGradient'](tubo)).toContain('cyan-950');

    const acero = {
      ...mockProduct,
      sku: 'ACE-001',
      name: 'Varilla Corrugada 1/2"',
      category: 'Aceros'
    };
    expect(component['getCategoryType'](acero)).toBe('acero');

    const ladrillo = {
      ...mockProduct,
      sku: 'LAD-001',
      name: 'Ladrillo Estructural',
      category: 'Mampostería'
    };
    expect(component['getCategoryType'](ladrillo)).toBe('mamposteria');
  });
});
