import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SetBidComponent } from "../../../pop-ups/set-bid/set-bid.component";
import { homeCardModel } from '../home-card/homeCardModel';
import { HomeCardComponent } from "../home-card/home-card.component";
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-live-listings',
  standalone: true,
  imports: [CommonModule, SetBidComponent, HomeCardComponent],
  templateUrl: './live-listings.component.html',
  styleUrls: ['../home-card/home-card.component.css']
})
export class LiveListingsComponent implements OnInit {
  cards: homeCardModel[] = [];

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLiveListings();
  }

  loadLiveListings(): void {
    this.http.get<any[]>(`${this.apiUrl}/products/livelistings`).subscribe({
      next: (data) => {
        this.cards = data
          .filter(item => item.is_active !== 0)
          .map(item => ({
            image: item.image || 'assets/all2.svg',
            carname: item.carname,
            productid: item.productid,
            price: item.price,
            city: item.city
          }));
      },
      error: (err) => console.error('Error fetching live listings:', err)
    });
  }
}