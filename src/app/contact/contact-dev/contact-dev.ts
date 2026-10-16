import { Component, signal } from '@angular/core';

import {
  CONTACT_BUTTON_LABEL,
  CONTACT_HEADING,
  CONTACT_INTRO,
  DEV_EMAIL,
  DEV_EMAIL_LINK,
  DEV_GITHUB_URL,
  DEV_LINKEDIN_URL,
  EXTERNAL_LINK_REL,
} from '../contact.constants';

/** UI only. A button that shows or hides the developer's contact details. */
@Component({
  imports: [],
  selector: 'app-contact-dev',
  host: { '(document:keydown.escape)': 'close()' },
  styleUrl: './contact-dev.css',
  templateUrl: './contact-dev.html',
})
export class ContactDev {
  protected readonly open = signal(false);

  protected readonly buttonLabel = CONTACT_BUTTON_LABEL;
  protected readonly heading = CONTACT_HEADING;
  protected readonly intro = CONTACT_INTRO;
  protected readonly email = DEV_EMAIL;
  protected readonly emailLink = DEV_EMAIL_LINK;
  protected readonly linkedInUrl = DEV_LINKEDIN_URL;
  protected readonly gitHubUrl = DEV_GITHUB_URL;
  protected readonly externalRel = EXTERNAL_LINK_REL;

  protected toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  protected close(): void {
    this.open.set(false);
  }
}
