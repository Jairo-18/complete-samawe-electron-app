import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { CustomValidationsService } from '../../../shared/services/customValidations.service';
import { UsersService } from '../../../organizational/services/users.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIcon,
    CommonModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  passwordMismatch = false;
  eyeOpen = faEye;
  eyeClose = faEyeSlash;
  showOldPassword: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  private readonly _usersService: UsersService = inject(UsersService);
  private readonly _router: Router = inject(Router);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _customValidations: CustomValidationsService = inject(
    CustomValidationsService
  );
  private readonly _passwordValidationService: CustomValidationsService =
    inject(CustomValidationsService);

  /**
   * Se recibe la información diligenciada en el formulario.
   * @param constructor - Creación del formulario.
   * @param oldPassword - Formulario 1 de información personal.
   * @param passwordStrength - Válida que la contraseña poseea más de 6 carácteres, 1 minúscula, 1 mayúscula y 1 carácter especial.
   * @param passwordsMatch - Válida que la contraseña sea igual a confirmar contraseña.
   */
  constructor(private fb: FormBuilder) {
    this.changePasswordForm = this.fb.group(
      {
        userId: [''],
        resetToken: [''],
        newPassword: [
          '',
          [
            Validators.required,
            this._passwordValidationService.passwordStrength()
          ]
        ],
        confirmNewPassword: ['', Validators.required]
      },
      {
        validators: this._customValidations.passwordsMatch(
          'newPassword',
          'confirmNewPassword'
        )
      }
    );
  }

  /**
   * @param ngOnInit - Al inicializar obtenemos el usuario por medio de la ruta.
   */
  ngOnInit(): void {
    const userId: string =
      this._activatedRoute.snapshot.paramMap.get('userId')!;
    const resetToken: string =
      this._activatedRoute.snapshot.queryParamMap.get('token')!;
    this.changePasswordForm.patchValue({ userId, resetToken });
  }

  /**
   * @param onChangePassword - Trae la contraseña antigua y cambia las contraseñas nuevas.
   */
  onChangePassword(): void {
    const { userId, newPassword, confirmNewPassword, resetToken } =
      this.changePasswordForm.value;

    if (newPassword !== confirmNewPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.passwordMismatch = false;

    this._usersService
      .recoveryPasswordByUserId({
        userId,
        newPassword,
        confirmNewPassword,
        resetToken
      })
      .subscribe({
        next: () => {
          this._router.navigate(['/auth/login']);
          this.changePasswordForm.reset();
        },
        error: (err) => {
          console.error('Error al cambiar la contraseña:', err);
        }
      });
  }

  /**
   * @param toggleOldPasswordVisibility - Ver antigua contraseña.
   */
  toggleOldPasswordVisibility(): void {
    this.showOldPassword = !this.showOldPassword;
  }

  /**
   * @param togglePasswordVisibility - Ver contraseña.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * @param toggleConfirmPasswordVisibility - Ver confirmar contraseña.
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
