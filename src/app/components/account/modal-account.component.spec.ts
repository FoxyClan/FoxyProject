import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAccount } from './modal-account.component';

describe('AccountComponent', () => {
  let component: ModalAccount;
  let fixture: ComponentFixture<ModalAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
