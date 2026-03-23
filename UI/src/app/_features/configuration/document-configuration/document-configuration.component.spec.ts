import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentConfigurationComponent } from './document-configuration.component';

describe('DocumentConfigurationComponent', () => {
  let component: DocumentConfigurationComponent;
  let fixture: ComponentFixture<DocumentConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentConfigurationComponent]
    });
    fixture = TestBed.createComponent(DocumentConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
