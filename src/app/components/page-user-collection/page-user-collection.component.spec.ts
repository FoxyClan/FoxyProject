import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageUserCollectionComponent } from './page-user-collection.component';

describe('PageUserCollectionComponent', () => {
  let component: PageUserCollectionComponent;
  let fixture: ComponentFixture<PageUserCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageUserCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageUserCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
