import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotateWarningComponent } from './rotate-warning.component';

describe('RotateWarningComponent', () => {
  let component: RotateWarningComponent;
  let fixture: ComponentFixture<RotateWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RotateWarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotateWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
