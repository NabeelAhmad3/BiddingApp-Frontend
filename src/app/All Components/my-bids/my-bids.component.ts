import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-my-bids',
  standalone: true,
  imports: [CommonModule, MatMenuModule, RouterLink],
  templateUrl: './my-bids.component.html',
  styleUrls: ['../card/card.component.css']
})
export class MyBidsComponent implements OnInit {
  myBids: any[] = [];
  myEarnings: any[] = [];
  myWonBids: any[] = [];
  activeTab: 'bids' | 'won' = 'bids';
  userid: string | null;

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {
    this.userid = localStorage.getItem('authUserId');
    localStorage.setItem('localdatadetail', '');
  }

  ngOnInit(): void {
    this.loadMyBids();

    this.loadMyWonBids();
  }

  loadMyBids(): void {
    this.http.get<any[]>(`${this.apiUrl}/product_bid/myBids/${this.userid}`).subscribe({
      next: (data) => {
        this.myBids = data.map(item => ({
          image: item.image || 'assets/all3.svg',
          carname: item.carname,
          basic_price: item.basic_price,
          bid_price: item.bid_price,
          city: item.city,
          productid: item.productid,
          created_at: item.created_at
        }));
      },
      error: (err) => console.error('Error fetching my bids', err)
    });
  }

  loadMyWonBids(): void {
    this.http.get<any[]>(`${this.apiUrl}/product_bid/myWonBids/${this.userid}`).subscribe({
      next: (data) => {
        this.myWonBids = data.map(item => ({
          image: item.image || 'assets/all3.svg',
          carname: item.carname,
          basic_price: item.basic_price,
          bid_price: item.bid_price,
          city: item.city,
          productid: item.productid,
          created_at: item.created_at
        }));
      },
      error: (err) => console.error('Error fetching won bids', err)
    });
  }
  localCardData(productid: number): void {
    localStorage.setItem('localdatadetail', JSON.stringify(productid));
  }

  setTab(tab: 'bids' | 'won'): void {
    this.activeTab = tab;
  }
}