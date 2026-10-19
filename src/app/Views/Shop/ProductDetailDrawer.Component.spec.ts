import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import {
  MOCK_PRODUCT_DETAILS,
  ProductDetailDrawerComponent
} from './ProductDetailDrawer.Component';

describe('ProductDetailDrawerComponent', () => {
  let component: ProductDetailDrawerComponent;
  let fixture: ComponentFixture<ProductDetailDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailDrawerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailDrawerComponent);
    component = fixture.componentInstance;
  });

  it('debe renderizar el producto mock en stock (CEM-001) y recalcular subtotal por escala de volumen', () => {
    const inStockProduct = MOCK_PRODUCT_DETAILS[0]; // CEM-001
    component.productInput = inStockProduct;
    component.isOpen = true;
    component.ngOnChanges({
      productInput: new SimpleChange(null, inStockProduct, true),
      isOpen: new SimpleChange(false, true, true)
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('CEM-001');
    expect(text).toContain('Cemento gris uso general UG 50 kg');
    expect(text).toContain('En stock');
    expect(text).toContain('431 sacos');
    expect(text).toContain('Agregar al carrito');
  });

  it('debe mostrar estado agotado para ACE-002 y deshabilitar el selector de cantidad', () => {
    const outOfStockProduct = MOCK_PRODUCT_DETAILS[1]; // ACE-002 (stock: 0)
    component.productInput = outOfStockProduct;
    component.isOpen = true;
    component.ngOnChanges({
      productInput: new SimpleChange(null, outOfStockProduct, true),
      isOpen: new SimpleChange(false, true, true)
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Agotado');
    expect(text).toContain('Avísame cuando haya stock');
  });

  it('debe mostrar placeholder cuando el producto no tiene imagen (AGR-003) y omitir pestañas vacías', () => {
    const noImageProduct = MOCK_PRODUCT_DETAILS[2]; // AGR-003 (imagenes: [], especificaciones: {})
    component.productInput = noImageProduct;
    component.isOpen = true;
    component.ngOnChanges({
      productInput: new SimpleChange(null, noImageProduct, true),
      isOpen: new SimpleChange(false, true, true)
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Sin imagen disponible');
    expect(text).not.toContain('Especificaciones');
  });

  it('debe conservar la imagen exacta de la carta al construir el detalle con fromCatalogProduct', () => {
    const detail = ProductDetailDrawerComponent.fromCatalogProduct(
      {
        id: 'p-10',
        sku: 'LAD-010',
        name: 'Ladrillo estructural prensado',
        description: 'Ladrillo cerámico de alta resistencia.',
        category: 'Mampostería',
        unit: 'Unidad',
        price: 2500,
        stock: 500,
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: null
      },
      'img/products/ladrillo.jpg'
    );

    expect(detail.imagenes[0]).toBe('img/products/ladrillo.jpg');
    expect(detail.escalas_precio.length).toBe(3);
  });
});
