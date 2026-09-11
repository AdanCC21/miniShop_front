import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, UserRole } from '../../auth/auth.service';
import { AuthMode, AuthTabsComponent } from '../../ui/auth-tabs/auth-tabs';
import { ButtonComponent } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle';
import { ToastService } from '../../ui/toast/toast.service';
import { Login, Register } from '../../api/auth';
import { RegisterDTO, RegShopDTO, RegUserDto } from '../../dto/auth';
import { Role } from '../../entities/Role';

@Component({
  selector: 'app-auth-page',
  imports: [AuthTabsComponent, ButtonComponent, InputComponent, ThemeToggleComponent],
  templateUrl: './auth-page.html'
})
export class AuthPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly toast = inject(ToastService);

  protected readonly mode = signal<AuthMode>('login');
  protected readonly role = signal<'encargado' | 'empleado'>('encargado');
  protected readonly step = signal<1 | 2>(1);

  protected readonly loginEmail = signal('');
  protected readonly loginPassword = signal('');
  protected readonly registerName = signal('');
  protected readonly registerEmail = signal('');
  protected readonly registerPassword = signal('');
  protected readonly registerConfirm = signal('');
  protected readonly storeUid = signal('');
  protected readonly storeName = signal('');
  protected readonly storeAddress = signal('');

  constructor() {
    if (this.auth.isLoggedIn) {
      // this.redirectAfterAuth(this.auth.role);
    }
  }

  protected switchMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.step.set(1);
  }

  protected onRoleChange(role: 'encargado' | 'empleado'): void {
    this.role.set(role);
    this.step.set(1);
  }

  protected nextStep(): void {
    if (!this.isStep1Valid()) {
      return;
    }
    this.step.set(2);
  }

  protected prevStep(): void {
    this.step.set(1);
  }

  protected async submitLogin() {
    const error = this.validateLogin();
    if (error) {
      this.toast.error(error, 'Formulario incompleto');
      return;
    }
    
    const data = await Login({ email: this.loginEmail(), password: this.loginPassword(), }, this.toast);
    console.log("Loged", data);
    if (data) {
      this.auth.setSessionFromBackend(data.user);
      this.redirectAfterAuth(data.user.role);
    }
  }

  protected async submitRegister() {
    const error = this.validateRegister();
    if (error) {
      this.toast.error(error, 'Formulario incompleto');
      return;
    }

    const dto: RegisterDTO = {
      user: {
        name: this.registerName(),
        password: this.registerPassword(),
        email: this.registerEmail()
      } as RegUserDto,
      shop: this.role() === 'empleado' ?
        this.storeUid() : {
          name: this.storeName(),
          address: this.storeAddress()
        } as RegShopDTO
    }

    const res = await Register(dto, this.toast);
    if (res) {
      this.toast.info("Su usuario fue creado de manera exitosa, porfavor inicia sesion para ingresar.")
      setTimeout(() => {
        window.location.reload();
      }, 3200);
    }
  }

  private validateLogin(): string | null {
    if (!this.loginEmail().trim()) {
      return 'Ingresa tu correo.';
    }
    if (!this.isValidEmail(this.loginEmail())) {
      return 'Ingresa un correo válido.';
    }
    if (!this.loginPassword()) {
      return 'Ingresa tu contraseña.';
    }
    return null;
  }

  private isStep1Valid(): boolean {
    const error = this.validateRegisterBasics();
    if (error) {
      this.toast.error(error, 'Formulario incompleto');
      return false;
    }
    return true;
  }

  private validateRegister(): string | null {
    const error = this.validateRegisterBasics();
    if (error) {
      return error;
    }
    if (this.role() === 'encargado' && !this.storeName().trim()) {
      return 'Ingresa el nombre de la tienda.';
    }
    if (this.role() === 'encargado' && !this.storeAddress().trim()) {
      return 'Ingresa la dirección de la tienda.';
    }
    return null;
  }

  private validateRegisterBasics(): string | null {
    if (!this.registerName().trim()) {
      return 'Ingresa tu nombre.';
    }
    if (!this.registerEmail().trim()) {
      return 'Ingresa tu correo.';
    }
    if (!this.isValidEmail(this.registerEmail())) {
      return 'Ingresa un correo válido.';
    }
    if (!this.registerPassword()) {
      return 'Ingresa una contraseña.';
    }
    if (this.registerPassword().length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (this.registerPassword() !== this.registerConfirm()) {
      return 'Las contraseñas no coinciden.';
    }
    if (this.role() === 'empleado' && !this.storeUid().trim()) {
      return 'Ingresa el UID de la tienda.';
    }
    return null;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  private redirectAfterAuth(role: Role | null): void {
    if (!role) {
      this.toast.error('El rol del usuario no es valido. Intente iniciar sesion de nuevo')
      return;
    };

    console.log(role);
    switch (role) {
      case Role.EMPLOYEE:
        this.router.navigate(['/dashboard']);
        break;
      case Role.MANAGER:
        this.router.navigate(['/dashboard']);
        break;
      case Role.WAITING:
        this.router.navigate(['/esperando']);
        break;
      case Role.ADMIN:
        this.router.navigate(['/admin']);
        break;
      default:
        console.log("Rol invalido o no especificado");
    }
  }
}
