import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../../environments/environments';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit, AfterViewInit {
  activeTab: 'dashboard' | 'products' | 'users' | 'bids' = 'dashboard';
  products: any[] = [];
  users: any[] = [];
  bids: any[] = [];
  totalProducts: number = 0;
  totalUsers: number = 0;
  totalBids: number = 0;
  activeBids: number = 0;
  completedBids: number = 0;
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('cityChart') cityChartRef!: ElementRef;
  @ViewChild('priceChart') priceChartRef!: ElementRef;
  @ViewChild('bidsChart') bidsChartRef!: ElementRef;

  private charts: Chart[] = [];

  private apiUrl = environment.apiUrl;
  // private baseUrl = 'http://localhost:5000/admin';
  private userid = localStorage.getItem('authUserId');

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const role = localStorage.getItem('authRole');
    if (role !== 'admin') {
      this.router.navigate(['/']);
      return;
    }
    this.loadAll();
  }

  ngAfterViewInit(): void {}

  loadAll(): void {
    this.loadProducts();
    this.loadUsers();
    this.loadBids();
  }

  loadProducts(): void {
    this.http.get<any[]>(`${this.apiUrl}/admin/products/${this.userid}`).subscribe({
      next: (data) => {
        this.products = data;
        this.totalProducts = data.length;
        this.tryRenderCharts();
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  loadUsers(): void {
    this.http.get<any[]>(`${this.apiUrl}/admin/users/${this.userid}`).subscribe({
      next: (data) => {
        this.users = data;
        this.totalUsers = data.length;
        this.tryRenderCharts();
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  loadBids(): void {
    this.http.get<any[]>(`${this.apiUrl}/admin/bids/${this.userid}`).subscribe({
      next: (data) => {
        this.bids = data;
        this.totalBids = data.length;
        this.tryRenderCharts();
      },
      error: (err) => console.error('Error loading bids', err)
    });
  }
  tryRenderCharts(): void {
    if (this.products.length > 0 && this.users.length > 0 && this.bids.length >= 0) {
      setTimeout(() => this.renderCharts(), 100);
    }
  }

  renderCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    this.renderStatusChart();
    this.renderCityChart();
    this.renderPriceChart();
    this.renderBidsChart();
  }
  renderStatusChart(): void {
    const el = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!el) return;
    let available = 0, live = 0, completed = 0;
    let checked = 0;

    this.products.forEach(p => {
      this.http.get<any>(`${this.apiUrl}/product_bid/bidStatus/${p.productid}`).subscribe({
        next: (bid) => {
          if (bid.is_active) live++;
          else if (bid.bid_end_time) completed++;
          else available++;
          checked++;

          if (checked === this.products.length) {
            const chart = new Chart(el, {
              type: 'doughnut',
              data: {
                labels: ['Available', 'Bidding Live', 'Completed'],
                datasets: [{
                  data: [available, live, completed],
                  backgroundColor: ['#4ade80', '#4361ee', '#fbbf24'],
                  borderWidth: 2
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  title: { display: true, text: 'Products by Bid Status' }
                }
              }
            });
            this.charts.push(chart);
          }
        }
      });
    });
  }
  renderCityChart(): void {
    const el = document.getElementById('cityChart') as HTMLCanvasElement;
    if (!el) return;

    const cityCounts: Record<string, number> = {};
    this.products.forEach(p => {
      cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    });

    const chart = new Chart(el, {
      type: 'bar',
      data: {
        labels: Object.keys(cityCounts),
        datasets: [{
          label: 'Products',
          data: Object.values(cityCounts),
          backgroundColor: '#4361ee',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Products per City' }
        },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
    this.charts.push(chart);
  }
  renderPriceChart(): void {
    const el = document.getElementById('priceChart') as HTMLCanvasElement;
    if (!el) return;

    const ranges: Record<string, number> = {
      'Under 500K': 0,
      '500K - 1M': 0,
      '1M - 3M': 0,
      '3M - 5M': 0,
      'Above 5M': 0
    };

    this.products.forEach(p => {
      const price = p.price;
      if (price < 500000) ranges['Under 500K']++;
      else if (price < 1000000) ranges['500K - 1M']++;
      else if (price < 3000000) ranges['1M - 3M']++;
      else if (price < 5000000) ranges['3M - 5M']++;
      else ranges['Above 5M']++;
    });

    const chart = new Chart(el, {
      type: 'bar',
      data: {
        labels: Object.keys(ranges),
        datasets: [{
          label: 'Products',
          data: Object.values(ranges),
          backgroundColor: ['#4ade80', '#60a5fa', '#f59e0b', '#f87171', '#a78bfa'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Products by Price Range' }
        },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
    this.charts.push(chart);
  }
  renderBidsChart(): void {
    const el = document.getElementById('bidsChart') as HTMLCanvasElement;
    if (!el) return;

    const dateCounts: Record<string, number> = {};
    this.bids.forEach(b => {
      const date = new Date(b.created_at).toLocaleDateString('en-PK');
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const sorted = Object.entries(dateCounts).sort((a, b) =>
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    const chart = new Chart(el, {
      type: 'line',
      data: {
        labels: sorted.map(e => e[0]),
        datasets: [{
          label: 'Bids placed',
          data: sorted.map(e => e[1]),
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67,97,238,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4361ee'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Bids Over Time' }
        },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
    this.charts.push(chart);
  }
  setTab(tab: 'dashboard' | 'products' | 'users' | 'bids'): void {
    this.activeTab = tab;
    if (tab === 'dashboard') {
      setTimeout(() => this.renderCharts(), 100);
    }
  }

  deleteProduct(productid: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.http.delete(`${this.apiUrl}/deleteProduct/${this.userid}/${productid}`).subscribe({
      next: () => this.products = this.products.filter(p => p.productid !== productid),
      error: (err) => console.error('Error deleting product', err)
    });
  }

  deleteUser(targetid: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.http.delete(`${this.apiUrl}/deleteUser/${this.userid}/${targetid}`).subscribe({
      next: () => this.users = this.users.filter(u => u.userid !== targetid),
      error: (err) => console.error('Error deleting user', err)
    });
  }

  viewProduct(productid: number): void {
    this.router.navigate(['/admin/product', productid]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}