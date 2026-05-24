import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-set-bid',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-bid.component.html',
  styleUrls: ['./set-bid.component.css']
})
export class SetBidComponent implements OnInit, OnDestroy {
  Bid: FormGroup;
  userid: string | null;
  isAdmin: boolean = false;
  @Input() productid?: number;
  currentBid: number = 0;
  isActive: boolean = false;
  bidEndTime: Date | null = null;
  timeLeft: string = '';
  timerInterval: any;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.Bid = this.fb.group({
      price: ['', [Validators.required, Validators.min(100000)]],
      duration_hours: ['', [Validators.required, Validators.min(1), Validators.max(72)]]
    });
    this.userid = localStorage.getItem('authUserId');
    this.isAdmin = localStorage.getItem('authRole') === 'admin';
  }

  ngOnInit(): void {
    this.loadBidStatus();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  loadBidStatus(): void {
    if (!this.productid) return;
    this.http.get<any>(`http://localhost:5000/product_bid/bidStatus/${this.productid}`).subscribe({
      next: (data) => {
        this.currentBid = data.price || 0;
        this.isActive = !!data.is_active;
        this.bidEndTime = data.bid_end_time ? new Date(data.bid_end_time) : null;
        if (this.isActive && this.bidEndTime) {
          this.startTimer();
        }
      },
      error: (err) => console.error('Error loading bid status', err)
    });
  }

  startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.bidEndTime) return;
      const now = new Date();
      const diff = this.bidEndTime.getTime() - now.getTime();

      if (diff <= 0) {
        this.timeLeft = 'Bidding Ended';
        this.isActive = false;
        clearInterval(this.timerInterval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      this.timeLeft = `${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }

  onStartBid(): void {
    if (this.Bid.invalid) {
      this.Bid.markAllAsTouched();
      return;
    }
    const { price, duration_hours } = this.Bid.value;
    this.http.post(
      `http://localhost:5000/product_bid/startBid/${this.userid}/${this.productid}`,
      { price, duration_hours }
    ).subscribe({
      next: (response: any) => {
        alert(response.message);
        this.Bid.reset();
        this.loadBidStatus();
      },
      error: (err) => alert(err.error?.error || 'Error starting bid')
    });
  }

  onSubmit(): void {
    if (!this.isActive) {
      alert('Bidding is not active for this product.');
      return;
    }

    const price = this.Bid.get('price')?.value;

    if (!price || price <= this.currentBid) {
      alert(`Your bid must be higher than current bid of PKR ${this.currentBid.toLocaleString()}`);
      return;
    }

    this.http.put(
      `http://localhost:5000/product_bid/createBid/${this.userid}/${this.productid}`,
      { price }
    ).subscribe({
      next: (response: any) => {
        alert(response.message);
        this.currentBid = price;
        this.Bid.reset();
      },
      error: (err) => alert(err.error?.error || 'Error placing bid')
    });
  }

  viewCarDetails(): void {
    if (this.productid) {
      localStorage.setItem('localdatadetail', this.productid.toString());
      this.router.navigate(['/details']);
    }
  }
}