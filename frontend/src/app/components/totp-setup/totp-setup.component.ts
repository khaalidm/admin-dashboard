import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-totp-setup',
  templateUrl: './totp-setup.component.html',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./totp-setup.component.scss']
})
export class TotpSetupComponent {
  qrCodeUrl: string = '';
  totpForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.totpForm = this.fb.group({
      email: [''],
      token: ['']
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    if (isPlatformBrowser(this.platformId)) {
      const email = localStorage.getItem('email');
      if (email) {
        this.authService.totpSetup(email).subscribe((response: { qrCodeUrl: string }) => {
          this.qrCodeUrl = response.qrCodeUrl;
        });
      } else {
        console.log('Email not found in localStorage');
        // Handle case where email is not found in local storage
      }
    }
  }

  onSubmit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const email = localStorage.getItem('email');
      if (email) {
        this.totpForm.patchValue({ email });
        if (this.totpForm.valid) {
          this.authService.verifyTotp(this.totpForm.value).subscribe(
            (response: { token: string }) => {
              localStorage.setItem('jwtToken', response.token);
              window.location.href = '/admin-dashboard';
            },
            (error: any) => {
              // Handle TOTP verification error
            }
          );
        }
      } else {
        // Handle case where email is not found in local storage
      }
    }
  }
}
