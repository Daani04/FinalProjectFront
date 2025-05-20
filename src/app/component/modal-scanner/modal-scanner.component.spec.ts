import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalScannerComponent } from './modal-scanner.component';

describe('ModalScannerComponent', () => {
  let component: ModalScannerComponent;
  let fixture: ComponentFixture<ModalScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalScannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
