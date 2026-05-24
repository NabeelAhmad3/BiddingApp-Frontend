import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SetBidComponent } from '../../../pop-ups/set-bid/set-bid.component'; 

@Component({
  selector: 'app-admin-product-detail',
  standalone: true,
  imports: [CommonModule, SetBidComponent], 
  templateUrl: './admin-product-detail.component.html',
  styleUrls: ['./admin-product-detail.component.css']
})
export class AdminProductDetailComponent implements OnInit {
  product: any = null;
  activeImageIndex = 0;
  loading = true;

  private baseUrl = 'http://localhost:5000/admin';
  private userid = localStorage.getItem('authUserId');

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const productid = this.route.snapshot.paramMap.get('productid');
    if (productid) {
      this.loadProductDetail(productid);
    }
  }

  loadProductDetail(productid: string): void {
    this.http.get<any>(`${this.baseUrl}/productDetail/${this.userid}/${productid}`).subscribe({
      next: (data) => {
        this.product = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product detail:', err);
        this.loading = false;
      }
    });
  }

  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  deleteProduct(): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.http.delete(`${this.baseUrl}/deleteProduct/${this.userid}/${this.product.productid}`).subscribe({
      next: () => {
        alert('Product deleted successfully');
        this.router.navigate(['/admin']);
      },
      error: (err) => console.error('Error deleting product:', err)
    });
  }
}