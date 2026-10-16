import { TestBed } from '@angular/core/testing';

import { FileService } from './file-service';

describe('FileService', () => {
  let service: FileService;
  let clicked: HTMLAnchorElement | undefined;

  beforeEach(() => {
    clicked = undefined;
    URL.createObjectURL = vi.fn(() => 'blob:game-vault-test');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked = this;
    });
    service = TestBed.inject(FileService);
  });

  afterEach(() => vi.restoreAllMocks());

  describe('download', () => {
    it('saves the text as a file with the given name', async () => {
      service.download('vault.json', '{"a":1}');
      const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob;
      expect(await blob.text()).toBe('{"a":1}');
      expect(clicked?.getAttribute('download')).toBe('vault.json');
      expect(clicked?.getAttribute('href')).toBe('blob:game-vault-test');
    });

    it('cleans up the link and the temporary URL afterwards', () => {
      service.download('vault.json', '{}');
      expect(document.body.contains(clicked!)).toBe(false);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:game-vault-test');
    });
  });

  describe('readText', () => {
    it('reads the text of a file', async () => {
      const file = new File(['{"hello":"world"}'], 'friend.json', { type: 'application/json' });
      await expect(service.readText(file)).resolves.toBe('{"hello":"world"}');
    });
  });
});
