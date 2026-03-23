import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDisbursedComponent } from './card-disbursed.component';

describe('CardDisbursedComponent', () => {
  let component: CardDisbursedComponent;
  let fixture: ComponentFixture<CardDisbursedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardDisbursedComponent]
    });
    fixture = TestBed.createComponent(CardDisbursedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
