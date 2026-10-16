import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  LOGIN_PROMPT_LINK_TEXT,
  LOGIN_PROMPT_MESSAGE,
  LOGIN_PROMPT_SUFFIX,
  LOGIN_PROMPT_WELCOME,
  LOGIN_ROUTE,
} from '../auth.constants';

/** UI only. Tells a logged-out visitor to log in; the parent decides when it shows and what dismiss does. */
@Component({
  imports: [RouterLink],
  selector: 'app-login-prompt',
  styleUrl: './login-prompt.css',
  templateUrl: './login-prompt.html',
})
export class LoginPrompt {
  readonly dismiss = output<void>();

  protected readonly welcome = LOGIN_PROMPT_WELCOME;
  protected readonly message = LOGIN_PROMPT_MESSAGE;
  protected readonly linkText = LOGIN_PROMPT_LINK_TEXT;
  protected readonly suffix = LOGIN_PROMPT_SUFFIX;
  protected readonly loginRoute = LOGIN_ROUTE;
}
