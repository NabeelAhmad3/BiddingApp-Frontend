import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  products: any[] = [];
  isLoggedIn: boolean = false;
  Authdata: any = {};
  errorMessage: string | null = null;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
    localStorage.setItem('localdatadetail', '');
    this.Authdata = {
      token: localStorage.getItem('authToken'),
      userid: localStorage.getItem('authUserId')
    };
    this.isLoggedIn = !!this.Authdata.token;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const carname = params['carname'];
      const productid = params['productid'] ? +params['productid'] : null;

      if (carname || productid !== null) {
        const searchQuery: any = {};
        if (carname) searchQuery.carname = carname;
        if (productid) searchQuery.productid = productid.toString();

        this.searchProducts(searchQuery);
      }
    });
  }

  searchProducts(searchQuery: { carname?: string, productid?: string }): void {
    this.http.get<any[]>(`${this.apiUrl}/products/search`, {
      params: searchQuery
    }).subscribe(
      (results) => {
        if (results.length > 0) {
          this.products = results.map(product => ({
            walkicon: 'assets/all7.svg',
            walk: '(10 mins to walk)',
            status: 'Available',
            carname: product.carname,
            image: 'assets/all2.svg',
            description: product.description,
            price: `PKR: ${product.price.toLocaleString()}`,
            fuelicon: 'assets/all4.svg',
            fueltype: product.fueltype,
            caricon: 'assets/all5.svg',
            cartype: product.cartype,
            locationicon: 'assets/all6.svg',
            city: product.city,
            productid: product.productid
          }));

          this.products.forEach((product: any) => {
            this.http.get<any>(`${this.apiUrl}/products/productsInfo/${product.productid}`)
              .subscribe({
                next: (info) => {
                  product.image = info.images?.[0] ?? 'assets/all2.svg';
                }
              });
          });

          this.errorMessage = null;
        } else {
          this.products = [];
          this.errorMessage = 'No products found matching your search criteria.';
        }
      },
      (error) => {
        console.error('Search error:', error);
        this.errorMessage = 'An error occurred while searching for products.';
      }
    );
  }

  localCardData(data: number) {
    localStorage.setItem('localdatadetail', JSON.stringify(data));
  }
}
