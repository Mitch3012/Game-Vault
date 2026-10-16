import { DOCUMENT } from '@angular/common';
import { Service, inject } from '@angular/core';

/** The only code that touches the browser's file APIs: saving a file and reading one the user picked. */
@Service()
export class FileService {
  private readonly document = inject(DOCUMENT);

  /** Saves `text` to the user's computer as a file called `fileName`. */
  download(fileName: string, text: string): void {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = fileName;
    this.document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  readText(file: File): Promise<string> {
    return file.text();
  }
}
