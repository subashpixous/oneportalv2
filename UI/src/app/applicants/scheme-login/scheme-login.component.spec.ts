import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeLoginComponent } from './scheme-login.component';

describe('SchemeLoginComponent', () => {
  let component: SchemeLoginComponent;
  let fixture: ComponentFixture<SchemeLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeLoginComponent]
    });
    fixture = TestBed.createComponent(SchemeLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
