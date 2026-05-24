import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-sell-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sell-products.component.html',
  styleUrls: ['./sell-products.component.css']
})
export class SellProductsComponent {
  sellProducts: FormGroup;
  imageUrls: string[] = [];
  imageUploadError = false;
  userid: string | null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.sellProducts = this.fb.group({
      carname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      price: ['', [Validators.required, Validators.min(100000), Validators.max(100000000)]],
      model: ['', Validators.required],
      cartype: ['', Validators.required],
      fueltype: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      description: ['', [Validators.maxLength(1000)]],
      images: this.fb.array(this.createImageControls())
    });
    this.userid = localStorage.getItem('authUserId');
  }

  get images(): FormArray {
    return this.sellProducts.get('images') as FormArray;
  }

  createImageControls(): FormControl[] {
    const controls = [];
    for (let i = 0; i < 5; i++) {
      controls.push(this.fb.control(''));
    }
    return controls;
  }

  // Programmatically trigger the hidden file input
  triggerFileInput(index: number): void {
    const input = document.getElementById(`imageUpload_${index}`) as HTMLInputElement;
    if (input) input.click();
  }

  onFileChange(event: any, index: number): void {
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

  // Remove an uploaded image and reset that slot
  removeImage(index: number): void {
    this.imageUrls[index] = '';
    this.images.at(index).setValue('');
  }

  onSubmit(): void {
    const uploadedCount = this.imageUrls.filter(url => url && url.trim() !== '').length;
    this.imageUploadError = uploadedCount < 3;

    if (this.sellProducts.invalid || this.imageUploadError) {
      this.sellProducts.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.sellProducts.value,
      userid: this.userid
    };

    this.http.post<any>('http://localhost:5000/products/addProducts', payload).subscribe(
      response => {
        alert(response.message);
        this.imageUrls = [];
        this.sellProducts.reset();
      },
      error => {
        console.error('Error adding product', error);
        alert('Failed to add product. Please try again.');
      }
    );
  }
}