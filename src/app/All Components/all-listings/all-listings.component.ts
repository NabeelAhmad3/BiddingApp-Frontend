import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FeaturesComponent } from '../../features/features.component';
import { FilterModalComponent } from '../../pop-ups/filter-modal/filter-modal.component';
import { CommonModule } from '@angular/common';

interface AddFavoriteResponse {
  message: string;
  productid: number;
  userid: number;
}

@Component({
  selector: 'app-all-listings',
  standalone: true,
  imports: [FeaturesComponent, FilterModalComponent, CommonModule, RouterLink],
  templateUrl: './all-listings.component.html',
  styleUrls: ['./all-listings.component.css'],
})
export class AllListingsComponent implements OnInit {
  products: any[] = [];

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.http.get<any[]>('http://localhost:5000/products/allData').subscribe({
      next: (data) => {
        this.products = data.map((product) => ({
          walkicon: 'assets/all7.svg',
          walk: '(10 mins to walk)',
          status: 'Checking...',  // ✅ default while loading
          isActive: false,
          bidStarted: false,
          carname: product.carname,
          image: product.images && product.images.length > 0
            ? product.images[0]
            : 'assets/all2.svg',
          description: product.description,
          price: `PKR: ${product.price.toLocaleString()}`,
          fuelicon: 'assets/all4.svg',
          fueltype: product.fueltype,
          caricon: 'assets/all5.svg',
          cartype: product.cartype,
          locationicon: 'assets/all6.svg',
          city: product.city,
          productid: product.productid,
          userid: product.userid,
        }));

        // ✅ Fetch bid status for each product
        this.products.forEach((product: any) => {
          this.http.get<any>(`http://localhost:5000/product_bid/bidStatus/${product.productid}`)
            .subscribe({
              next: (bidData) => {
                product.isActive = !!bidData.is_active;
                product.bidStarted = !!bidData.bid_end_time;

                // ✅ Set status text based on bid state
                if (bidData.is_active) {
                  product.status = 'Bidding Live';
                } else if (bidData.bid_end_time) {
                  product.status = 'Not Available';
                } else {
                  product.status = 'Available';
                }
                if (!bidData.is_active && bidData.bid_end_time) {
                  this.products = this.products.filter(p => p.productid !== product.productid);
                }
              },
              error: () => {
                product.status = 'Available'; 
              }
            });
        });
      },
      error: (err) => console.error('Error fetching products:', err),
    });
  }

  localCardData(data: number) {
    localStorage.setItem('localdatadetail', JSON.stringify(data));
  }
}