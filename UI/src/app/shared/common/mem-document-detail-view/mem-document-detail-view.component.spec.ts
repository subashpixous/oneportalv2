import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemDocumentDetailViewComponent } from './mem-document-detail-view.component';

describe('MemDocumentDetailViewComponent', () => {
  let component: MemDocumentDetailViewComponent;
  let fixture: ComponentFixture<MemDocumentDetailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemDocumentDetailViewComponent]
    });
    fixture = TestBed.createComponent(MemDocumentDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
