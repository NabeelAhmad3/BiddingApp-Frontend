import { Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { AllListingsComponent } from './All Components/all-listings/all-listings.component';
import { HomeComponent } from './All Components/home/home.component';
import { MyProductsComponent } from './All Components/my-products/my-products.component';
import { ContactUsComponent } from './All Components/contact-us/contact-us.component';
import { FAQComponent } from './All Components/faq/faq.component';
import { SellProductsComponent } from './All Components/sell-products/sell-products.component';
import { HelpUsComponent } from './All Components/help-us/help-us.component';
import { EditInformationComponent } from './All Components/edit-information/edit-information.component';
import { ProfileSettingComponent } from './All Components/profile-setting/profile-setting.component';
import { VerificationCenterComponent } from './All Components/verification-center/verification-center.component';
import { DetailsComponent } from './All Components/details/details.component';
import { PurchaseBidComponent } from './All Components/purchase-bid/purchase-bid.component';
import { SearchResultsComponent } from './All Components/search-results/search-results.component';
import { AuthGuard } from './auth.guard';
import { AdminHomeComponent } from './All Components/Admin/admin-home/admin-home.component';
import { AdminOnly } from './admin.only.guard';
import { AdminProductDetailComponent } from './All Components/Admin/admin-product-detail/admin-product-detail.component';
import { MyBidsComponent } from './All Components/my-bids/my-bids.component';
import { BidProductHistoryComponent } from './All Components/Admin/bid-product-history/bid-product-history.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'allListings', component: AllListingsComponent, canActivate: [AuthGuard], },
  { path: 'contactUs', component: ContactUsComponent },
  { path: 'faq', component: FAQComponent },
  { path: 'sellProducts', component: SellProductsComponent, canActivate: [AuthGuard] },
  { path: 'profileSet', component: ProfileSettingComponent, canActivate: [AuthGuard] },
  { path: 'verificationCent', component: VerificationCenterComponent, canActivate: [AuthGuard] },
  { path: 'helpUs', component: HelpUsComponent },
  { path: 'myProducts', component: MyProductsComponent, canActivate: [AuthGuard] },
  { path: 'details', component: DetailsComponent, canActivate: [AuthGuard] },
  { path: 'editInfo', component: EditInformationComponent, canActivate: [AuthGuard] },
  { path: 'purchaseBid', component: PurchaseBidComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchResultsComponent },
  { path: 'edit-product/:productid', component: EditInformationComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminHomeComponent, canActivate: [AdminOnly] },
  { path: 'admin/product/:productid', component: AdminProductDetailComponent, canActivate: [AdminOnly] },
  { path: 'myBids', component: MyBidsComponent, canActivate: [AuthGuard] },
  { path: 'admin/bid-history/:productid', component: BidProductHistoryComponent },
  { path: '**', redirectTo: '' }
];
