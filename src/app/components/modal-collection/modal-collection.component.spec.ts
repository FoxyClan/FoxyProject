import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCollectionComponent } from './modal-collection.component';

describe('ModalCollectionComponent', () => {
  let component: ModalCollectionComponent;
  let fixture: ComponentFixture<ModalCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
