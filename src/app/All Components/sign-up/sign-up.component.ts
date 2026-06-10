import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from './sign-up.services';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['../log-in/log-in.component.css'],
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  isLoggedIn: boolean = false;
  Authdata: any = {};

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
    this.Authdata = {
      token: localStorage.getItem('authToken'),
      userid: localStorage.getItem('authUserId')
    };
    this.isLoggedIn = !!this.Authdata.token;
  }

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(10), Validators.maxLength(30)]],
      phone: ['', [Validators.required, Validators.min(1000000000), Validators.max(100000000000)]],
      cnic: ['', [Validators.required, Validators.min(1000000000), Validators.max(10000000000000)]],
      city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      terms: [false, Validators.requiredTrue],
    });
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    this.addUser(this.signUpForm.value);
    this.signUpForm.reset();
  }
  addUser(data: any): void {
    this.http.post(`${this.apiUrl}/users/register`, data).subscribe(
      (response: any) => {
        alert(response.message);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('authUserId', response.userid);
        window.location.reload();
      },
      (error: any) => {
        console.error('Error adding user', error);
      }
    );
  }

}
