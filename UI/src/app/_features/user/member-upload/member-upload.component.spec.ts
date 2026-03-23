import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberUploadComponent } from './member-upload.component';

describe('MemberUploadComponent', () => {
  let component: MemberUploadComponent;
  let fixture: ComponentFixture<MemberUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberUploadComponent]
    });
    fixture = TestBed.createComponent(MemberUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
