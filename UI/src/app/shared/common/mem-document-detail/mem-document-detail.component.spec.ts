import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemDocumentDetailComponent } from './mem-document-detail.component';

describe('MemDocumentDetailComponent', () => {
  let component: MemDocumentDetailComponent;
  let fixture: ComponentFixture<MemDocumentDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemDocumentDetailComponent]
    });
    fixture = TestBed.createComponent(MemDocumentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
