import { TypeItem } from './../../../shared/interfaces/relatedDataGeneral';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { MatDialog } from '@angular/material/dialog';
import { RelatedDataService } from '../../../shared/services/relatedData.service';
 

@Component({
  selector: 'app-card-types',
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './card-types.component.html',
  styleUrls: ['./card-types.component.scss']
})
export class CardTypesComponent {
  @Input() infoTypes?: TypeItem[];
  @Input() paginationParams!: PaginationInterface;
  @Output() page = new EventEmitter<PageEvent>();
  @Output() edit = new EventEmitter<{ type: string; id: number | string }>();
  @Output() remove = new EventEmitter<{ type: string; id: number | string }>();
  @Input() selectedType!: string;

  private readonly _relatedDataService: RelatedDataService =
    inject(RelatedDataService);
  private readonly _matDialog: MatDialog = inject(MatDialog);

  loading: boolean = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getIdKey(item: any): string {
    return Object.keys(item).find((key) => key.endsWith('Id')) || 'id';
  }
}
