import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);

  ngOnInit(): void {
    this.translate.setDefaultLang('ar');
    this.languageService.initialize();
  }
}
