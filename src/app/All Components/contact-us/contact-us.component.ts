import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css'] 
})
export class ContactUsComponent {
  contactForm: FormGroup =new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3),Validators.maxLength(20)]),
    email: new FormControl('', [Validators.required, Validators.email,Validators.minLength(15),Validators.maxLength(35)]),
    city: new FormControl('', [Validators.required, Validators.minLength(3),Validators.maxLength(20),]),
    phoneNo: new FormControl(''),
    message: new FormControl(''),
  });

  private apiUrl = environment.apiUrl;
  constructor(private fb: FormBuilder,private http: HttpClient){}
  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
  
  this.http.post(`${this.apiUrl}/contact`, this.contactForm.value)
  .subscribe({
    next: (response) => {
      console.log('Email sent successfully!', response);
      this.contactForm.reset();
    },
    error: (error) => {
      console.error('Error sending email:', error);
    }
  });
}
}

