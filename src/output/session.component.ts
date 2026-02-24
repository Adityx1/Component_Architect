import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface AuthService {
  login(email: string, password: string): Promise<{ success: boolean; token?: string }>;
}

@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4" style="background-color: #0f172a;">
      <div class="w-full max-w-md">
        <div class="glass_bg glass_border border rounded-[24px] p-8 shadow-lg backdrop-blur-[16px]">
          <div class="text-center mb-8">
            <h2 class="text_primary text-[1.875rem] font-bold mb-2" style="font-family: 'Inter', sans-serif;">Welcome Back</h2>
            <p class="text_secondary text-[0.875rem]" style="font-family: 'Inter', sans-serif;">Sign in to your account to continue</p>
          </div>

          <form #loginForm="ngForm" (ngSubmit)="onSubmit()" class="space-y-6" novalidate>
            <div>
              <label for="email" class="text_primary text-[0.875rem] block mb-2" style="font-family: 'Inter', sans-serif;">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                email
                #emailInput="ngModel"
                class="w-full px-4 py-3 glass_bg glass_border border rounded-[8px] text_primary placeholder:text-[#64748b] focus:outline-none focus:border-[#6366f1] transition-all duration-[250ms] ease"
                style="font-family: 'Inter', sans-serif;"
                placeholder="Enter your email"
              />
              <div *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)" class="text-[#ef4444] text-[0.75rem] mt-1" style="font-family: 'Inter', sans-serif;">
                <span *ngIf="emailInput.errors?.['required']">Email is required.</span>
                <span *ngIf="emailInput.errors?.['email']">Please enter a valid email.</span>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label for="password" class="text_primary text-[0.875rem]" style="font-family: 'Inter', sans-serif;">Password</label>
                <a href="#" class="text_primary text-[0.875rem] hover:underline" style="font-family: 'Inter', sans-serif;">Forgot password?</a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                minlength="6"
                #passwordInput="ngModel"
                class="w-full px-4 py-3 glass_bg glass_border border rounded-[8px] text_primary placeholder:text-[#64748b] focus:outline-none focus:border-[#6366f1] transition-all duration-[250ms] ease"
                style="font-family: 'Inter', sans-serif;"
                placeholder="Enter your password"
              />
              <div *ngIf="passwordInput.invalid && (passwordInput.dirty || passwordInput.touched)" class="text-[#ef4444] text-[0.75rem] mt-1" style="font-family: 'Inter', sans-serif;">
                <span *ngIf="passwordInput.errors?.['required']">Password is required.</span>
                <span *ngIf="passwordInput.errors?.['minlength']">Password must be at least 6 characters.</span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  [(ngModel)]="rememberMe"
                  class="w-4 h-4 text-[#6366f1] glass_bg glass_border border rounded-[4px] focus:ring-[#6366f1] focus:ring-offset-0"
                />
                <span class="text_secondary text-[0.875rem] ml-2" style="font-family: 'Inter', sans-serif;">Remember me</span>
              </label>
            </div>

            <div *ngIf="error" class="text-[#ef4444] text-[0.875rem] text-center" style="font-family: 'Inter', sans-serif;">{{ error }}</div>

            <button
              type="submit"
              class="w-full py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-[#f8fafc] font-semibold rounded-[8px] transition-all duration-[250ms] ease hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              style="font-family: 'Inter', sans-serif;"
              [disabled]="!loginForm.form.valid || loading"
            >
              {{ loading ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text_secondary text-[0.875rem]" style="font-family: 'Inter', sans-serif;">
              Don't have an account? 
              <a href="#" class="primary_text hover:underline">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginCardComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  private authService = inject<AuthService>(undefined as any);
  private router = inject(Router);

  async onSubmit() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = null;
    try {
      const result = await this.authService.login(this.email, this.password);
      if (result.success) {
        await this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Invalid credentials';
      }
    } catch (error) {
      this.error = 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}