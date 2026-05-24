import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { WorksSectionComponent } from "./works-section/works-section.component";
import { FeaturesComponent } from "../../features/features.component";
import { ProfileModalComponent } from "../../pop-ups/profile-modal/profile-modal.component";
import { CommonModule } from '@angular/common';
import { LiveListingsComponent } from "./live-listings/live-listings.component";
import { FeatureProductsComponent } from "./feature-products/feature-products.component";
import { Router } from '@angular/router';
import { RegistrationPageComponent } from "../../pop-ups/registration-page/registration-page.component";
import { SearchResultsComponent } from "../search-results/search-results.component";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    WorksSectionComponent,
    FeaturesComponent,
    ProfileModalComponent,
    CommonModule,
    LiveListingsComponent,
    FeatureProductsComponent,
    FormsModule,
    RegistrationPageComponent,
    SearchResultsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isNavbarOpen: boolean = false;
  searchQuery: string = '';
  isLoggedIn: boolean = false;
  Authdata: any = {};
  errorMessage: string | null = null;

  constructor(private router: Router, private http: HttpClient) {
    this.Authdata = {
      token: localStorage.getItem('authToken'),
      userid: localStorage.getItem('authUserId')
    };
    if (this.Authdata.token) {
      this.isLoggedIn = true;
    }
    console.log(localStorage.getItem('userdata'))
  }

  handleToggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }
  searchProduct() {
    if (this.searchQuery.trim()) {
      const productid = parseInt(this.searchQuery, 10);
      const queryParams: any = {};

      if (isNaN(productid)) {
        queryParams.carname = this.searchQuery;
      } else {
        queryParams.productid = productid;
      }

      this.http.get<any[]>('http://localhost:5000/products/search', { params: queryParams })
        .subscribe(
          (results) => {
            if (results.length > 0) {
              this.errorMessage = null;
              this.router.navigate(['/search'], { queryParams });
            } else {
              this.errorMessage = 'No products found';
              this.searchQuery = '';
            }
          },
          (error) => {
            console.error('Search error:', error);
            this.errorMessage = 'An error occurred while searching for products.';
            this.searchQuery = '';
          }
        );
    }
  }
}
