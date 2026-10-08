import { Component, input } from '@angular/core';

/** UI only. One line of status text for loading, empty and error states. */
@Component({
  imports: [],
  selector: 'app-state-message',
  styleUrl: './state-message.css',
  templateUrl: './state-message.html',
})
export class StateMessage {
  readonly text = input.required<string>();
}
