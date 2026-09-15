import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { placeholderImage } from '../product-card/product-card';
import { ModalComponent } from '../../../ui/modal/modal';
import { ButtonComponent } from '../../../ui/button/button';
import { InputComponent } from '../../../ui/input/input';
import { GetProdByCode, UpdateProduct, updateQuantity } from '../../../api/products';
import { ToastService } from '../../../ui/toast/toast.service';
import { ProductDTO, UpdateProductDTO } from '../../../dto/product.dto';

@Component({
  selector: 'app-product-details',
  imports: [ButtonComponent, InputComponent, ModalComponent, RouterLink],
  templateUrl: './product-details.html'
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected toast = inject(ToastService);

  protected readonly product = signal<ProductDTO | null>(null)
  protected readonly fallbackImage = placeholderImage;

  protected readonly editOpen = signal(false);
  protected readonly editName = signal('');
  protected readonly editPrice = signal('');
  protected readonly editCode = signal('');

  protected readonly editQuantity = signal(false);
  protected readonly newQuantity = signal(0);

  async ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code') ?? '';
    const product = await GetProdByCode(code, this.toast);
    this.product.set(product);
  }

  protected toggleUpdateQuantity(newState: boolean) {
    newState ? this.newQuantity.set(this.product()?.quantity || 0) : 0
    this.editQuantity.set(newState);
  }

  protected handleQuantity(value: string) {
    this.newQuantity.set(Number(value));
  }

  protected async saveQuantity() {
    if (this.newQuantity() < 0) {
      this.toast.error("La cantidad no puede ser menor a 0");
      return;
    }

    const res = await updateQuantity([{ id: this.product()!.id, quantity: `${this.newQuantity()}` }], this.toast);
    if (res) {
      this.toast.success(`La cantidad de ${this.product()?.name} a sido actualizada a ${this.newQuantity()}`, "Exito")
      setTimeout(() => { window.location.reload() }, 2000)
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
    }
    const res = await UpdateProduct(dto, this.toast);
    if (res) {
      this.toast.success(`Producto actualizado con exito`, "Exito");
      this.editOpen.set(false);
      setTimeout(() => { window.location.reload() }, 2000)
    }
  }
}
