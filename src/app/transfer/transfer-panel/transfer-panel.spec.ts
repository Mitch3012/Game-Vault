import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGameEntry } from '../../game-vault-interface';
import { ImportPreview } from '../transfer-interface';
import { TransferPanel } from './transfer-panel';

const preview: ImportPreview = {
  owner: 'Sam',
  total: 12,
  fresh: new Array(10).fill({ rawgId: 1 } as NewGameEntry),
  alreadyOwned: 2,
  skipped: 0,
};

describe('TransferPanel', () => {
  let fixture: ComponentFixture<TransferPanel>;
  const html = () => fixture.nativeElement as HTMLElement;
  const button = (label: string) =>
    [...html().querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.includes(label))!;
  const picker = () => html().querySelector<HTMLInputElement>('input[type="file"]')!;

  const render = async (
    inputs: Partial<{
      canExport: boolean;
      canImport: boolean;
      busy: boolean;
      preview: ImportPreview | null;
      message: string;
    }> = {},
  ) => {
    const values = { canExport: true, canImport: true, busy: false, preview: null, message: '', ...inputs };
    Object.entries(values).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TransferPanel] }).compileComponents();
    fixture = TestBed.createComponent(TransferPanel);
  });

  it('shows export and import buttons', async () => {
    await render();
    expect(button('Export vault').disabled).toBe(false);
    expect(button('Import vault').disabled).toBe(false);
  });

  it('warns that an export contains your name, ratings and notes', async () => {
    await render();
    expect(html().textContent).toContain('Exports include your name, ratings and notes');
  });

  it('disables export when there is nothing to export', async () => {
    await render({ canExport: false });
    expect(button('Export vault').disabled).toBe(true);
  });

  it('disables import while it cannot be done', async () => {
    await render({ canImport: false });
    expect(button('Import vault').disabled).toBe(true);
  });

  it('asks for an export when Export is clicked', async () => {
    await render();
    let exported = 0;
    fixture.componentInstance.exportVault.subscribe(() => exported++);
    button('Export vault').click();
    expect(exported).toBe(1);
  });

  it('opens the file picker, for JSON files, when Import is clicked', async () => {
    await render();
    const open = vi.spyOn(picker(), 'click');
    button('Import vault').click();
    expect(open).toHaveBeenCalledOnce();
    expect(picker().getAttribute('accept')).toContain('.json');
  });

  it('passes on the file the user picks, and lets the same file be picked again', async () => {
    await render();
    const file = new File(['{}'], 'friend.json');
    const chosen: File[] = [];
    fixture.componentInstance.fileChosen.subscribe((f) => chosen.push(f));
    Object.defineProperty(picker(), 'files', { value: [file], configurable: true });
    picker().dispatchEvent(new Event('change'));
    expect(chosen).toEqual([file]);
    expect(picker().value).toBe('');
  });

  it('ignores a picker that was closed without a file', async () => {
    await render();
    const chosen: File[] = [];
    fixture.componentInstance.fileChosen.subscribe((f) => chosen.push(f));
    Object.defineProperty(picker(), 'files', { value: [], configurable: true });
    picker().dispatchEvent(new Event('change'));
    expect(chosen).toEqual([]);
  });

  it('shows no preview by default', async () => {
    await render();
    expect(button('Cancel')).toBeUndefined();
  });

  describe('with a preview', () => {
    beforeEach(() => render({ preview }));

    it('describes what would happen and says the games go to the Wishlist', () => {
      expect(html().textContent).toContain("Sam's vault: 12 games. 10 new, 2 already in your vault, 0 skipped.");
      expect(html().textContent).toContain('Wishlist');
    });

    it('offers to import the new games, and confirms when clicked', () => {
      let confirmed = 0;
      fixture.componentInstance.confirmImport.subscribe(() => confirmed++);
      button('Import 10 as Wishlist').click();
      expect(confirmed).toBe(1);
    });

    it('cancels when Cancel is clicked', () => {
      let cancelled = 0;
      fixture.componentInstance.cancelImport.subscribe(() => cancelled++);
      button('Cancel').click();
      expect(cancelled).toBe(1);
    });

    it('shows progress and cannot be confirmed twice while importing', async () => {
      await render({ preview, busy: true });
      expect(button('Importing').disabled).toBe(true);
    });
  });

  it('announces a message politely', async () => {
    await render({ message: 'Imported 3 games as Wishlist.' });
    expect(html().querySelector('[role="status"]')?.textContent).toContain('Imported 3 games as Wishlist.');
  });

  it('shows no message area when there is nothing to say', async () => {
    await render();
    expect(html().querySelector('[role="status"]')).toBeNull();
  });
});
