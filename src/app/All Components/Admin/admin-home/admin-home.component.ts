import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  activeTab: 'products' | 'users' | 'bids' = 'products';
  products: any[] = [];
  users: any[] = [];

  private baseUrl = 'http://localhost:5000/admin';
  private userid = localStorage.getItem('authUserId');

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const role = localStorage.getItem('authRole');
    if (role !== 'admin') {
      this.router.navigate(['/']);
      return;
    }
    this.loadProducts();
    this.loadUsers();
  }

  loadProducts(): void {
    this.http.get<any[]>(`${this.baseUrl}/products/${this.userid}`).subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error('Error loading products', err)
    });
  }

  loadUsers(): void {
    this.http.get<any[]>(`${this.baseUrl}/users/${this.userid}`).subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error loading users', err)
    });
  }


  deleteProduct(productid: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.http.delete(`${this.baseUrl}/deleteProduct/${this.userid}/${productid}`).subscribe({
      next: () => this.products = this.products.filter(p => p.productid !== productid),
      error: (err) => console.error('Error deleting product', err)
    });
  }

viewProduct(productid: number): void {
    this.router.navigate(['/admin/product', productid]);
}
  deleteUser(targetid: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.http.delete(`${this.baseUrl}/deleteUser/${this.userid}/${targetid}`).subscribe({
      next: () => this.users = this.users.filter(u => u.userid !== targetid),
      error: (err) => console.error('Error deleting user', err)
    });
  }

  setTab(tab: 'products' | 'users' | 'bids'): void {
    this.activeTab = tab;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}