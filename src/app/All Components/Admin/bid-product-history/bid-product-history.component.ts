import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-bid-product-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bid-product-history.component.html',
  styleUrl: './bid-product-history.component.css'
})
export class BidProductHistoryComponent implements OnInit {

  bids: any[] = [];
  productid: string | null = null;

  loading = true;

  private baseUrl = 'http://localhost:5000/admin';
  private userid = localStorage.getItem('authUserId');

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.productid =
      this.route.snapshot.paramMap.get('productid');

    if (this.productid) {
      this.loadBidHistory();
    }

  }

  loadBidHistory(): void {

    this.http.get<any[]>(
      `${this.baseUrl}/productBidHistory/${this.userid}/${this.productid}`
    ).subscribe({

      next: (data) => {

        this.bids = data;
        this.loading = false;

      },

      error: (err) => {

        console.error(err);
        this.loading = false;

      }

    });

  }

  goBack(): void {

    this.router.navigate([
      '/admin/product',
      this.productid
    ]);

  }

}