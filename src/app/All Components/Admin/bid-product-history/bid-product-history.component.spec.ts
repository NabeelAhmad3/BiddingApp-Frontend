import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidProductHistoryComponent } from './bid-product-history.component';

describe('BidProductHistoryComponent', () => {
  let component: BidProductHistoryComponent;
  let fixture: ComponentFixture<BidProductHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidProductHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BidProductHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
