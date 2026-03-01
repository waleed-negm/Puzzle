import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly translate = inject(TranslateService);

  private readonly storageKey = 'language';
  private readonly supportedLanguages = ['ar', 'en'];

  initialize(): void {
    const storedLang = localStorage.getItem(this.storageKey);
    const language = storedLang && this.supportedLanguages.includes(storedLang)
      ? storedLang
      : 'ar';

    this.setLanguage(language);
  }

  setLanguage(language: string): void {
    if (!this.supportedLanguages.includes(language)) {
      return;
    }

    this.translate.use(language);
    localStorage.setItem(this.storageKey, language);

    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
  }

  getCurrentLanguage(): string {
    return localStorage.getItem(this.storageKey) || 'ar';
  }

  switchLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    this.setLanguage(newLang);
  }
}
