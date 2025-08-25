import { Component, Input } from '@angular/core';
import { GetAccommodationPaginatedList } from '../../../service-and-product/interface/accommodation.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-card-accommodation',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './card-accommodation.component.html',
  styleUrl: './card-accommodation.component.scss'
})
export class CardAccommodationComponent {
  @Input() accommodation?: GetAccommodationPaginatedList;

  get mainImage(): string {
    return (
      this.accommodation?.images?.[0]?.imageUrl ||
      'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png'
    );
  }
}
