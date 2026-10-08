import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarRating } from './star-rating';
import { buildStars, nextRating, starLabel } from './star-rating-helpers';

describe('star rating helpers', () => {
  it('sets the clicked star, and clears when the selected star is clicked again', () => {
    expect(nextRating(null, 3)).toBe(3);
    expect(nextRating(2, 5)).toBe(5);
    expect(nextRating(4, 4)).toBeNull();
  });

  it('labels stars with correct singular and plural', () => {
    expect(starLabel(1)).toBe('1 star');
    expect(starLabel(3)).toBe('3 stars');
  });

  it('builds five stars, filled up to the rating and checked on the rating', () => {
    const stars = buildStars(3);
    expect(stars.map((star) => star.value)).toEqual([1, 2, 3, 4, 5]);
    expect(stars.map((star) => star.filled)).toEqual([true, true, true, false, false]);
    expect(stars.map((star) => star.checked)).toEqual([false, false, true, false, false]);
  });

  it('builds all-empty stars when there is no rating', () => {
    const stars = buildStars(null);
    expect(stars.some((star) => star.filled || star.checked)).toBe(false);
  });
});

describe('StarRating', () => {
  let fixture: ComponentFixture<StarRating>;
  const buttons = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="radio"]'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StarRating] }).compileComponents();
    fixture = TestBed.createComponent(StarRating);
    await fixture.whenStable();
  });

  it('renders five labelled star buttons, none checked by default', () => {
    expect(buttons().map((button) => button.getAttribute('aria-label'))).toEqual([
      '1 star',
      '2 stars',
      '3 stars',
      '4 stars',
      '5 stars',
    ]);
    expect(buttons().some((button) => button.getAttribute('aria-checked') === 'true')).toBe(false);
  });

  it('shows the current value as the checked star', async () => {
    fixture.componentInstance.value.set(4);
    await fixture.whenStable();
    expect(buttons().map((button) => button.getAttribute('aria-checked'))).toEqual([
      'false',
      'false',
      'false',
      'true',
      'false',
    ]);
  });

  it('sets the value when a star is clicked', async () => {
    buttons()[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(3);
  });

  it('clears the value when the selected star is clicked again', async () => {
    fixture.componentInstance.value.set(5);
    await fixture.whenStable();
    buttons()[4].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBeNull();
  });
});
