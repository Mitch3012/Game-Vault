import { Component, computed, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

import { buildStars, nextRating } from './star-rating-helpers';

/** UI only. A 1 to 5 star picker that plugs into signal forms. Clicking the selected star clears it. */
@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.html',
})
export class StarRating implements FormValueControl<number | null> {
  readonly value = model<number | null>(null);

  protected readonly stars = computed(() => buildStars(this.value()));

  protected onSelect(star: number): void {
    this.value.set(nextRating(this.value(), star));
  }
}
