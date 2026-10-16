import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEV_EMAIL, DEV_GITHUB_URL, DEV_LINKEDIN_URL } from '../contact.constants';
import { ContactDev } from './contact-dev';

describe('ContactDev', () => {
  let fixture: ComponentFixture<ContactDev>;
  const html = () => fixture.nativeElement as HTMLElement;
  const toggle = () => html().querySelector<HTMLButtonElement>('button[aria-controls]')!;
  const panel = () => html().querySelector('#contact-panel');
  const link = (part: string) =>
    [...html().querySelectorAll<HTMLAnchorElement>('#contact-panel a')].find((a) => a.href.includes(part))!;

  const open = async () => {
    toggle().click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ContactDev] }).compileComponents();
    fixture = TestBed.createComponent(ContactDev);
    await fixture.whenStable();
  });

  it('shows a "Contact the dev" button and no details at first', () => {
    expect(toggle().textContent).toContain('Contact the dev');
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(panel()).toBeNull();
  });

  it('shows the details when the button is clicked', async () => {
    await open();
    expect(panel()).not.toBeNull();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(panel()?.textContent).toContain(DEV_EMAIL);
  });

  it('links the email address with mailto', async () => {
    await open();
    expect(link('mailto:').getAttribute('href')).toBe(`mailto:${DEV_EMAIL}`);
  });

  it('links to LinkedIn and GitHub', async () => {
    await open();
    expect(link('linkedin.com').getAttribute('href')).toBe(DEV_LINKEDIN_URL);
    expect(link('github.com').getAttribute('href')).toBe(DEV_GITHUB_URL);
  });

  it('uses the plain LinkedIn profile address, without the self-view setting', () => {
    expect(DEV_LINKEDIN_URL).toBe('https://www.linkedin.com/in/mitch3012jcm/');
    expect(DEV_LINKEDIN_URL).not.toContain('isSelfProfile');
  });

  it('opens LinkedIn and GitHub in a new tab, safely', async () => {
    await open();
    for (const part of ['linkedin.com', 'github.com']) {
      expect(link(part).getAttribute('target')).toBe('_blank');
      expect(link(part).getAttribute('rel')).toContain('noopener');
      expect(link(part).getAttribute('rel')).toContain('noreferrer');
    }
  });

  it('does not open the email link in a new tab', async () => {
    await open();
    expect(link('mailto:').getAttribute('target')).toBeNull();
  });

  it('hides the details when the button is clicked again', async () => {
    await open();
    await open();
    expect(panel()).toBeNull();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('hides the details with the Close button', async () => {
    await open();
    [...html().querySelectorAll<HTMLButtonElement>('#contact-panel button')]
      .find((b) => b.textContent?.includes('Close'))
      ?.click();
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });

  it('hides the details when Escape is pressed', async () => {
    await open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });
});
