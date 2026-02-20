import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-[#0f172a] font-['Inter']">
      <div class="w-full max-w-md">
        <div class="bg-white/[0.08] backdrop-blur-[16px] border border-white/[0.12] rounded-[16px] shadow-[0_16px_32px_rgba(0,0,0,0.6)] p-8">
          <div class="text-center mb-8">
            <h2 class="text-[1.875rem] font-bold text-[#f8fafc] mb-2">Welcome Back</h2>
            <p class="text-[#94a3b8] text-[1rem]">Sign in to your account</p>
          </div>
          
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="email" class="block text-[#94a3b8] text-[0.875rem] font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-[8px] text-[#f8fafc] placeholder:text-[#64748b] focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all duration-[250ms_ease]"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label for="password" class="block text-[#94a3b8] text-[0.875rem] font-medium mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-[8px] text-[#f8fafc] placeholder:text-[#64748b] focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all duration-[250ms_ease]"
                placeholder="Enter your password"
              />
            </div>
            
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  [(ngModel)]="remember"
                  class="w-4 h-4 bg-white/[0.05] border border-white/[0.12] rounded text-[#6366f1] focus:ring-[#6366f1]/20 focus:ring-2"
                />
                <span class="ml-2 text-[0.875rem] text-[#94a3b8]">Remember me</span>
              </label>
              <a href="#" class="text-[0.875rem] text-[#6366f1] hover:text-[#a5b4fc] transition-colors duration-[250ms_ease]">Forgot password?</a>
            </div>
            
            <button
              type="submit"
              class="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-3 px-4 rounded-[8px] transition-all duration-[250ms_ease] shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            >
              Sign In
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <p class="text-[0.875rem] text-[#94a3b8]">
              Don't have an account? 
              <a href="#" class="text-[#6366f1] hover:text-[#a5b4fc] transition-colors duration-[250ms_ease]">Sign up</a>
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
  email = '';
  password = '';
  remember = false;

  onSubmit() {
    console.log('Login attempt:', { email: this.email, password: this.password, remember: this.remember });
  }
}