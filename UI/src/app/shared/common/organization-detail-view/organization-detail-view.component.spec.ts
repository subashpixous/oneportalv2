import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationDetailViewComponent } from './organization-detail-view.component';

describe('OrganizationDetailViewComponent', () => {
  let component: OrganizationDetailViewComponent;
  let fixture: ComponentFixture<OrganizationDetailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationDetailViewComponent]
    });
    fixture = TestBed.createComponent(OrganizationDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
