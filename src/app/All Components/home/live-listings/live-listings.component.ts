import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SetBidComponent } from "../../../pop-ups/set-bid/set-bid.component";
import { homeCardModel } from '../home-card/homeCardModel';
import { HomeCardComponent } from "../home-card/home-card.component";


@Component({
  selector: 'app-live-listings',
  standalone: true,
  imports: [CommonModule, SetBidComponent, HomeCardComponent],
  templateUrl: './live-listings.component.html',
  styleUrls: ['../home-card/home-card.component.css']
})
export class LiveListingsComponent implements OnInit {
  cards: homeCardModel[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<homeCardModel[]>('http://localhost:5000/products/livelistings').subscribe((data) => {
      this.cards = data.map(item => ({
        image: item.image,
        carname: item.carname,
        productid: item.productid,
        price: item.price,
        city: item.city
      }));
    },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }
}
