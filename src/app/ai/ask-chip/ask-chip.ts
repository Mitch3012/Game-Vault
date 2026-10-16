import { Component, input, output } from '@angular/core';

/** UI only. One example request the user can click; the parent decides what picking it does. */
@Component({
  imports: [],
  selector: 'app-ask-chip',
  styleUrl: './ask-chip.css',
  templateUrl: './ask-chip.html',
})
export class AskChip {
  readonly label = input.required<string>();
  readonly disabled = input<boolean>(false);

  readonly pick = output<string>();
}
