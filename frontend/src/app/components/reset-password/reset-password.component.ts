import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  message: string = '';
  token: string = '';

  constructor(private route: ActivatedRoute, private authService: AuthService, private fb: FormBuilder) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*[0-9]).{8,}$')
      ]]
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token')!;
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.authService.resetPassword(this.token, this.resetPasswordForm.value.newPassword).subscribe(
        response => this.message = 'Password reset successful',
        error => this.message = 'Error resetting password'
      );
    }
  }
}
