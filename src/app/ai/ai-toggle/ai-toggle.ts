import { Component, input, output } from '@angular/core';

import { AI_PRIVACY_NOTE } from '../suggestions.constants';

/** UI only. An on/off switch for AI suggestions; the parent decides what toggling does. */
@Component({
  imports: [],
  selector: 'app-ai-toggle',
  styleUrl: './ai-toggle.css',
  templateUrl: './ai-toggle.html',
})
export class AiToggle {
  readonly enabled = input.required<boolean>();
  /** The value the user asked for: `true` to turn AI on, `false` to turn it off. */
  readonly toggle = output<boolean>();

  protected readonly privacyNote = AI_PRIVACY_NOTE;

  protected onToggle(): void {
    this.toggle.emit(!this.enabled());
  }
}
