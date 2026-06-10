import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-verification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verification-center.component.html',
  styleUrls: ['./verification-center.component.css']
})
export class VerificationCenterComponent {
  
  imageUrls: string[] = [];
  verificationForm: FormGroup;
  errorMessage: string = '';

  private apiUrl = environment.apiUrl;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.verificationForm = this.fb.group({
      images: this.fb.array(this.createImageControls())
    });
  }

  get images(): FormArray {
    return this.verificationForm.get('images') as FormArray;
  }

  createImageControls(): FormControl[] {
    const controls = [];
    for (let i = 0; i < 2; i++) {
      controls.push(this.fb.control('')); 
    }
    return controls;
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result.split(',')[1]; 
        this.images.at(index).setValue(base64String);  
        this.imageUrls[index] = e.target.result;  
      };
      reader.readAsDataURL(file);
    }
  }

  validateForm(): boolean {
    this.errorMessage = '';
    const valid = this.images.controls.every(control => control.value);
    if (!valid) {
      this.errorMessage = 'Please upload both front and back images of your CNIC.';
    }
    return valid;
  }
  
  onSubmit() {
    if (this.validateForm()) {
      const formData = {
        userid: 65, 
        image1: this.images.at(0).value, 
        image2: this.images.at(1).value
      };
  
      this.http.post<any>(`${this.apiUrl}/id_verification`, formData).subscribe(
        response => {
          alert(response.message);
          this.imageUrls = [];  
          this.verificationForm.reset(); 
        },
        error => {
          console.error('Error adding product', error);
        }
      );
    }
  }
}
