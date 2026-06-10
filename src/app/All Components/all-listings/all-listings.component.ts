import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FeaturesComponent } from '../../features/features.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-all-listings',
  standalone: true,
  imports: [FeaturesComponent, CommonModule, RouterLink, FormsModule],
  templateUrl: './all-listings.component.html',
  styleUrls: ['./all-listings.component.css'],
})
export class AllListingsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  filterCarname: string = '';
  filterStatus: string = '';
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.http.get<any[]>(`${this.apiUrl}/products/allData`).subscribe({
      next: (data) => {
        this.products = data.map((product) => ({
          walkicon: 'assets/all7.svg',
          walk: '(10 mins to walk)',
          status: 'Checking...',
          isActive: false,
          bidStarted: false,
          carname: product.carname,
          image: 'assets/all2.svg',
          description: product.description,
          price: product.price,
          priceDisplay: `PKR: ${product.price.toLocaleString()}`,
          fuelicon: 'assets/all4.svg',
          fueltype: product.fueltype,
          caricon: 'assets/all5.svg',
          cartype: product.cartype,
          locationicon: 'assets/all6.svg',
          city: product.city,
          productid: product.productid,
          userid: product.userid,
        }));

        this.filteredProducts = [...this.products];

        this.products.forEach((product: any) => {
          this.http.get<any>(`${this.apiUrl}/products/productsInfo/${product.productid}`)
            .subscribe({
              next: (info) => {
                product.image = info.images?.[0] ?? 'assets/all2.svg';
                this.applyFilters();
              }
            });

          this.http.get<any>(`${this.apiUrl}/product_bid/bidStatus/${product.productid}`)
            .subscribe({
              next: (bidData) => {
                product.isActive = !!bidData.is_active;
                product.bidStarted = !!bidData.bid_end_time;

                if (bidData.is_active) {
                  product.status = 'Bidding Live';
                } else if (bidData.bid_end_time) {
                  product.status = 'Completed';
                } else {
                  product.status = 'Available';
                }

                this.applyFilters();
              },
              error: () => {
                product.status = 'Available';
                this.applyFilters();
              }
            });
        });
      },
      error: (err) => console.error('Error fetching products:', err),
    });
  }
  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {

      const nameMatch = this.filterCarname
        ? product.carname.toLowerCase().includes(this.filterCarname.toLowerCase())
        : true;

      const statusMatch = this.filterStatus
        ? product.status === this.filterStatus
        : true;

      const minMatch = this.filterMinPrice !== null
        ? product.price >= this.filterMinPrice
        : true;

      const maxMatch = this.filterMaxPrice !== null
        ? product.price <= this.filterMaxPrice
        : true;

      return nameMatch && statusMatch && minMatch && maxMatch;
    });
  }

  resetFilters(): void {
    this.filterCarname = '';
    this.filterStatus = '';
    this.filterMinPrice = null;
    this.filterMaxPrice = null;
    this.filteredProducts = [...this.products];
  }

  localCardData(data: number) {
    localStorage.setItem('localdatadetail', JSON.stringify(data));
  }
}