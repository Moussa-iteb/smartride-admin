import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripDetailComponentComponent } from './trip-detail-component.component';

describe('TripDetailComponentComponent', () => {
  let component: TripDetailComponentComponent;
  let fixture: ComponentFixture<TripDetailComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TripDetailComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TripDetailComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
