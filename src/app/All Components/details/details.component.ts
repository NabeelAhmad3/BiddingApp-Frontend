import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SetBidComponent } from "../../pop-ups/set-bid/set-bid.component";
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, SetBidComponent],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  description = 'Etiam vulputate neque nec nulla consequat...';
  productInfo: any;
  productid?: number;
  sellerInfo: any = {};

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {
    const storedProductId = localStorage.getItem('localdatadetail');
    this.productid = storedProductId ? +storedProductId : undefined;
  }

  ngOnInit(): void {
    if (this.productid) {
      this.fetchProductAndSellerDetails(this.productid);
    }
  }
  fetchProductAndSellerDetails(productid: number) {
    this.http.get<any>(`${this.apiUrl}/products/productsInfo/${productid}`).subscribe(
      (data) => {
        if (data) {
          this.productInfo = data;
        }
      },
      (error) => {
        console.error('Error fetching product info:', error);
      }
    );
  }
}
