import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbabilityModalComponent } from './probability-modal.component';

describe('ProbabilityModalComponent', () => {
  let component: ProbabilityModalComponent;
  let fixture: ComponentFixture<ProbabilityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbabilityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbabilityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
