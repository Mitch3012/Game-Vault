import { Component, input, output } from '@angular/core';

/** UI only. Shows an error message the user can dismiss. */
@Component({
  selector: 'app-error-banner',
  templateUrl: './error-banner.html',
})
export class ErrorBanner {
  readonly message = input.required<string>();
  readonly dismiss = output<void>();
}
