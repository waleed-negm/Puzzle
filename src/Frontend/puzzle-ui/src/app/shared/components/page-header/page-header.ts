import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, TranslateModule, Button],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold m-0">
        {{ title() | translate }}
      </h2>
      @if (showAddButton()) {
        <p-button
          [label]="addButtonLabel() | translate"
          icon="pi pi-plus"
          (onClick)="addClick.emit()"
        />
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  showAddButton = input(false);
  addButtonLabel = input('common.add');
  addClick = output<void>();
}
