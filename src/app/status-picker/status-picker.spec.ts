import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusPicker } from './status-picker';

describe('StatusPicker', () => {
  let component: StatusPicker;
  let fixture: ComponentFixture<StatusPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
