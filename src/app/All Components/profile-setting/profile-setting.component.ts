import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-profile-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.css']
})
export class ProfileSettingComponent {
  profileSetForm: FormGroup;
  userid: string | null;
  private apiUrl = environment.apiUrl;

  constructor(private fb: FormBuilder, private Http: HttpClient) {
    this.profileSetForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(15), Validators.maxLength(35)]],
      phone: ['', [Validators.required, Validators.min(1000000000), Validators.max(100000000000)]],
      cnic: ['', [Validators.required, Validators.min(1000000000), Validators.max(10000000000000)]],
      city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
    });

    this.userid = localStorage.getItem('authUserId');
    this.fetchUserData();
  }

  fetchUserData() {
    this.Http.get(`${this.apiUrl}/users/profileDetails/${this.userid}`).subscribe(
      (response: any) => {
        if (response && response.length > 0) {
          this.profileSetForm.patchValue({
            name: response[0].name,
            email: response[0].email,
            phone: response[0].phone,
            cnic: response[0].cnic,
            city: response[0].city,
            password: response[0].password
          });
        }
      },
      (error: any) => {
        console.error('Error fetching user data', error);
      }
    );
  }
  onSubmit() {
    if (this.profileSetForm.invalid) {
      this.profileSetForm.markAllAsTouched();
      return;
    }
    this.Http.put(`${this.apiUrl}/users/profileDetails/${this.userid}`, this.profileSetForm.value).subscribe(
      (response: any) => {
        console.log(response);
      },
      (error: any) => {
        console.error('Error adding user', error);
      }
    )
    alert("Profile Updated  Successfully")
  }

}
