import { ComponentFixture, TestBed } from '@angular/core/testing';
import { loginComponent } from './login.component';

describe('Auth', () => {
  let component: loginComponent;
  let fixture: ComponentFixture<loginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [loginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(loginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
