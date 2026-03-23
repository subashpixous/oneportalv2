import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCollectionReportComponent } from './card-collection-report.component';

describe('CardCollectionReportComponent', () => {
  let component: CardCollectionReportComponent;
  let fixture: ComponentFixture<CardCollectionReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardCollectionReportComponent]
    });
    fixture = TestBed.createComponent(CardCollectionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
