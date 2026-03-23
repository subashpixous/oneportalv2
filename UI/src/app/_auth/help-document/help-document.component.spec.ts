import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDocumentComponent } from './help-document.component';

describe('HelpDocumentComponent', () => {
  let component: HelpDocumentComponent;
  let fixture: ComponentFixture<HelpDocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HelpDocumentComponent]
    });
    fixture = TestBed.createComponent(HelpDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
