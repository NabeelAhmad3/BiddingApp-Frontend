import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-information',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-information.component.html',
  styleUrls: ['./edit-information.component.css']
})
export class EditInformationComponent implements OnInit {
  editInfoForm: FormGroup;
  userid: string | null;
  @Input() productid!: number;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editInfoForm = this.fb.group({
      carname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      price: ['', [Validators.required, Validators.min(100000), Validators.max(1000000000)]],
      cartype: ['', Validators.required],
      fueltype: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      description: ['', [Validators.maxLength(1000)]]
    });
    this.userid = localStorage.getItem('authUserId');
  }

  ngOnInit(): void {
    const routeProductId = this.route.snapshot.paramMap.get('productid');
    if (routeProductId) {
      this.productid = +routeProductId;  // came from /edit-product/:productid route
    }

    if (this.productid) {
      this.getProductData();
    } else {
      console.error('No productid available');
    }
  }

  getProductData(): void {
    this.http.get<any>(`http://localhost:5000/products/productsInfo/${this.productid}`)
      .subscribe(
        response => {
          this.editInfoForm.patchValue({
            carname: response.carname,
            price: response.price,
            cartype: response.cartype,
            fueltype: response.fueltype,
            city: response.city,
            address: response.address,
            description: response.description
          });
        },
        error => {
          console.error('Error fetching product data', error);
        }
      );
  }

  onSubmit(): void {
    if (this.editInfoForm.invalid) {
      this.editInfoForm.markAllAsTouched();
      return;
    }

    const updatedData = this.editInfoForm.value;

    this.http.put<any>(
      `http://localhost:5000/products/updateProduct/${this.productid}/${this.userid}`,
      updatedData
    ).subscribe(
      response => {
        alert('Product updated successfully');
        this.router.navigate(['/myProducts']); // ✅ Go back after save
      },
      error => {
        console.error('Error updating product', error);
        alert('Error updating product. Please try again.');
      }
    );
  }
}