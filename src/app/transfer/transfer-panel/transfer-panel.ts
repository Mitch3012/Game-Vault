import { Component, computed, input, output } from '@angular/core';

import { firstFile, previewSummary } from '../transfer-helpers';
import { ImportPreview } from '../transfer-interface';

/** UI only. Export and import buttons, the import preview and the result message. The parent does the work. */
@Component({
  imports: [],
  selector: 'app-transfer-panel',
  styleUrl: './transfer-panel.css',
  templateUrl: './transfer-panel.html',
})
export class TransferPanel {
  readonly canExport = input.required<boolean>();
  readonly canImport = input.required<boolean>();
  readonly busy = input.required<boolean>();
  /** What importing the chosen file would do. `null` = no file chosen. */
  readonly preview = input.required<ImportPreview | null>();
  readonly message = input.required<string>();

  readonly exportVault = output<void>();
  readonly fileChosen = output<File>();
  readonly confirmImport = output<void>();
  readonly cancelImport = output<void>();

  protected readonly summary = computed(() => {
    const preview = this.preview();
    return preview ? previewSummary(preview) : '';
  });
  protected readonly importLabel = computed(() => `Import ${this.preview()?.fresh.length ?? 0} as Wishlist`);

  protected onFile(picker: HTMLInputElement): void {
    const file = firstFile(picker.files);
    picker.value = '';
    if (file) this.fileChosen.emit(file);
  }
}
