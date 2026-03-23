import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsSentComponent } from './cards-sent.component';

describe('CardsSentComponent', () => {
  let component: CardsSentComponent;
  let fixture: ComponentFixture<CardsSentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardsSentComponent]
    });
    fixture = TestBed.createComponent(CardsSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
