import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatCard} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    MatCard,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    MatButton,
    MatInput,
    NgIf
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  totpForm: FormGroup;
  isLoginStep = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.totpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
    });
  }

  onSubmitLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value)
        .subscribe({
          next: () => {
            this.totpForm.patchValue({ email: this.loginForm.value.email });
            this.snackBar.open('Login successful, please enter your TOTP token', 'Close', { duration: 3000 });
            this.isLoginStep = false;
          },
          error: () => this.snackBar.open('Login failed', 'Close', { duration: 3000 })
        });
    }
  }

  onSubmitTotp() {
    if (this.totpForm.valid) {
      this.authService.verifyTotp(this.totpForm.value)
        .subscribe({
          next: (response) => {
            localStorage.setItem('jwtToken', response.token);
            this.snackBar.open('TOTP verification successful', 'Close', { duration: 3000 });
            // Navigate to the admin dashboard
            window.location.href = '/admin-dashboard';
          },
          error: () => this.snackBar.open('TOTP verification failed', 'Close', { duration: 3000 })
        });
    }
  }
}
