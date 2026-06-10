import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-purchase-bid',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './purchase-bid.component.html',
  styleUrls: ['./purchase-bid.component.css']
})
export class PurchaseBidComponent implements OnInit {
  summary: any = {}; 

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${this.apiUrl}/products`).subscribe(
      (data) => {
        if (data && data.length > 0) {
          const item = data[0];
          this.summary = {
            carname: item.carname,
            productid: item.productid,
            price: item.price,
          };
        }
      },
      (error) => {
        console.error('Error fetching item info:', error);
      }
    );
  }
}
