import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { TopbarComponent } from '../topbar/topbar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex min-h-screen">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col">
        <app-topbar></app-topbar>
        <main class="flex-1 p-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }

    main {
      background-color: var(--p-surface-ground);
    }
  `
})
export class MainLayout {}
