import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, JsonPipe, ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
})
export class LogInComponent implements OnInit {
  loginForm!: FormGroup;
  googleLogUrl = 'https://www.google.com/login/';
  facebookLogUrl = 'https://www.facebook.com/login/';
  Authdata: any;
  
    private apiUrl = environment.apiUrl;
  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(10), Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
    });
  }

onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formData = this.loginForm.value;
    this.http.post(`${this.apiUrl}/users/login`, formData).subscribe({
      next: (response: any) => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('authUserId', response.userid);
        localStorage.setItem('usertype', response.usertype);
        localStorage.setItem('authRole', response.role);
        localStorage.setItem('userdata', JSON.stringify({
          token: response.token,
          userid: response.userid,
          usertype: response.usertype,
          role: response.role
        }));
        if (response.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.reload();
        }
      },
      error: (error: any) => {
        alert(error.error.message || 'An error occurred during login');
      },
    });
}

}