import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
  pure: false
})
export class CurrencyFormatPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const currentLang = this.translate.currentLang || this.translate.defaultLang || 'ar';
    const formatted = value.toFixed(2);

    if (currentLang === 'ar') {
      return `${formatted} ر.س`;
    }

    return `${formatted} SAR`;
  }
}
