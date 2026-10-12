import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  signupForm = new FormGroup({
    userName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  });
  onSubmit(): void {
    // TODO: delegate to Authservice once it has a login method
  }
}
