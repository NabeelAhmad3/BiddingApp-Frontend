import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileModalComponent } from "../../pop-ups/profile-modal/profile-modal.component";
import { CardComponent } from '../card/card.component';
import { HttpClient } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { EditInformationComponent } from "../edit-information/edit-information.component";

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, CardComponent, ProfileModalComponent, MatMenuModule, RouterLink, EditInformationComponent],
  templateUrl: './my-products.component.html',
  styleUrls: ['../card/card.component.css']
})
export class MyProductsComponent implements OnInit {
  CarData: any = [];
  userid: string | null;
  selectedProductId: number | null = null;

  constructor(private http: HttpClient) {
    this.userid = localStorage.getItem('authUserId');
    localStorage.setItem('localdatadetail', '');
  }

  ngOnInit(): void {
    this.http.get<any>(`http://localhost:5000/products/myProducts/${this.userid}`).subscribe(
      (data) => {
        this.CarData = data.map((item: any) => ({
          image: item.image ? item.image : 'assets/all3.svg',
          carname: item.carname,
          price: item.price,
          eyeTxt: 3423,
          city: item.city,
          productid: item.productid,
          isActive: false,
          statusLabel: 'Available' // default
        }));

        this.CarData.forEach((car: any) => {
          this.http.get<any>(`http://localhost:5000/product_bid/bidStatus/${car.productid}`)
            .subscribe({
              next: (bidData) => {
                car.isActive = !!bidData.is_active;
                if (bidData.is_active) {
                  car.statusLabel = 'Bidding Live';
                } else if (bidData.bid_end_time) {
                  car.statusLabel = 'Completed';
                } else {
                  car.statusLabel = 'Available';
                }
              },
              error: () => {
                car.statusLabel = 'Available';
              }
            });
        });
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  deleteProduct(productid: number): void {
    if (!this.userid) return;
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.http.delete(`http://localhost:5000/products/deleteProduct/${productid}/${this.userid}`).subscribe(
      () => {
        this.CarData = this.CarData.filter((car: any) => car.productid !== productid);
      },
      (error) => {
        console.error('Error deleting product:', error);
      }
    );
  }

  localCardData(data: number): void {
    localStorage.setItem('localdatadetail', JSON.stringify(data));
  }
}