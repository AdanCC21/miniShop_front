import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { isProductIcon, ProductIconComponent, ProductIconPickerComponent, PRODUCT_ICONS } from '../product-icon/product-icon';
import { ModalComponent } from '../../../ui/modal/modal';
import { ButtonComponent } from '../../../ui/button/button';
import { InputComponent } from '../../../ui/input/input';
import { SelectComponent, SelectOption } from '../../../ui/select/select';
import { DeleteProduct, GetProdByCode, UpdateProduct, updateQuantity } from '../../../api/products';
import { GetCategories } from '../../../api/category';
import { CategoryDTO } from '../../../dto/category.dto';
import { ToastService } from '../../../ui/toast/toast.service';
import { ProductDTO, UpdateProductDTO } from '../../../dto/product.dto';

@Component({
  selector: 'app-product-details',
  imports: [ButtonComponent, InputComponent, ModalComponent, ProductIconComponent, ProductIconPickerComponent, RouterLink, SelectComponent],
  templateUrl: './product-details.html'
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected toast = inject(ToastService);

  protected readonly product = signal<ProductDTO | null>(null)
  protected isIcon(value: string | null | undefined): boolean {
    return isProductIcon(value);
  }

  protected readonly editOpen = signal(false);
  protected readonly editName = signal('');
  protected readonly editPrice = signal('');
  protected readonly editCode = signal('');
  protected readonly editIcon = signal('general');
  protected readonly categories = signal<CategoryDTO[]>([]);
  protected readonly editCategoryId = signal('');
  protected readonly categoryOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Sin categoría' },
    ...this.categories().map((category) => ({ value: category.id, label: category.name }))
  ]);

  protected readonly editQuantity = signal(false);
  protected readonly quantityMode = signal<'add' | 'set'>('add');
  protected readonly quantityToAdd = signal(0);
  protected readonly newQuantity = signal(0);

  protected readonly deleteProd = signal(false);
  protected readonly confirmDel = signal(false);

  async ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code') ?? '';
    const [product, categories] = await Promise.all([
      GetProdByCode(code, this.toast),
      GetCategories(this.toast)
    ]);
    this.product.set(product);
    this.categories.set(categories);
  }

  protected toggleUpdateQuantity(newState: boolean) {
    if (newState) {
      this.quantityMode.set('add');
      this.quantityToAdd.set(0);
      this.newQuantity.set(this.product()?.quantity || 0);
    }
    this.editQuantity.set(newState);
  }

  protected handleQuantity(value: string) {
    if (this.quantityMode() === 'add') {
      this.quantityToAdd.set(value === '' ? 0 : Number(value));
    } else {
      this.newQuantity.set(value === '' ? 0 : Number(value));
    }
  }

  protected changeQuantityMode(mode: 'add' | 'set'): void {
    this.quantityMode.set(mode);
  }

  protected resultingQuantity(): number {
    const current = Number(this.product()?.quantity ?? 0);
    return this.quantityMode() === 'add' ? current + this.quantityToAdd() : this.newQuantity();
  }

  protected async saveQuantity() {
    const targetQuantity = this.resultingQuantity();
    if (!Number.isInteger(targetQuantity) || targetQuantity < 0) {
      this.toast.error('La cantidad debe ser un número entero igual o mayor a 0.');
      return;
    }
    if (this.quantityMode() === 'add' && this.quantityToAdd() <= 0) {
      this.toast.error('Ingresa una cantidad mayor a 0 para agregar al inventario.');
      return;
    }

    const product = this.product();
    if (!product) return;

    const res = await updateQuantity([{ id: product.id, quantity: `${targetQuantity}` }], this.toast);
    if (res) {
      this.product.set({ ...product, quantity: targetQuantity });
      this.toast.success(
        this.quantityMode() === 'add'
          ? `Se agregaron ${this.quantityToAdd()} unidades. El inventario de ${product.name} ahora es de ${targetQuantity}.`
          : `El inventario de ${product.name} se actualizó a ${targetQuantity} unidades.`,
        'Éxito'
      );
      this.toggleUpdateQuantity(false)
    }
  }

  protected openEdit(): void {
    if (!this.product()) {
      return;
    }
    this.editName.set(this.product()!.name);
    this.editPrice.set(String(this.product()!.price));
    this.editCode.set(this.product()!.code);
    this.editCategoryId.set(this.product()!.categoryId ?? this.product()!.category?.id ?? '');
    const currentIcon = this.product()!.image;
    this.editIcon.set(currentIcon === 'drink' ? 'medicine' :
      PRODUCT_ICONS.some((option) => option.id === currentIcon) ? currentIcon! : 'general');
    this.editOpen.set(true);
  }

  protected closeEdit(): void {
    this.editOpen.set(false);
  }

  protected onNameChange(value: string): void {
    this.editName.set(value);
  }

  protected onPriceChange(value: string): void {
    this.editPrice.set(value);
  }

  protected onCodeChange(value: string): void {
    this.editCode.set(value);
  }

  protected onCategoryChange(value: string): void {
    this.editCategoryId.set(value);
  }

  protected async saveEdit() {
    if (!this.product() || !this.editName().trim()) {
      return;
    }
    const price = Number(this.editPrice());
    if (Number.isNaN(price) || price < 0) {
      return;
    }

    const dto: UpdateProductDTO = {
      id: this.product()?.id,
      name: this.editName().trim() ?? this.product()!.name,
      price: Number(this.editPrice()) ?? this.product()!.price,
      code: this.editCode() ?? this.product()!.code,
      image: this.editIcon(),
      categoryId: this.editCategoryId() || null,
    }
    const res = await UpdateProduct(dto, this.toast);
    if (res) {
      this.toast.success(`Producto actualizado con exito`, "Exito");
      this.editOpen.set(false);
      setTimeout(() => { window.location.reload() }, 2000)
    }
  }

  protected toggleDelProd(state: boolean) {
    this.deleteProd.set(state);
  }

  protected async confirmDeleteProduct(state: boolean) {
    if (!state) {
      this.toggleDelProd(false);
      return;
    }

    const res = await DeleteProduct(this.product()!.id, this.toast);
    if (res) {
      this.toast.success(`El producto ${this.product()!.name} fue eliminado`, 'Exito');
      this.toggleDelProd(false);
      this.router.navigate(['/products'])
      return;
    }
  }
}
