import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationPrivilegeComponent } from './application-privilege.component';

describe('ApplicationPrivilegeComponent', () => {
  let component: ApplicationPrivilegeComponent;
  let fixture: ComponentFixture<ApplicationPrivilegeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationPrivilegeComponent]
    });
    fixture = TestBed.createComponent(ApplicationPrivilegeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
