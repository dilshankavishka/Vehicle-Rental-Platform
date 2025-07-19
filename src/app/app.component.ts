import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="app-container">
      <app-navbar *ngIf="showNavbar"></app-navbar>
      <main [class.with-navbar]="showNavbar">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }
    
    main {
      min-height: 100vh;
    }
    
    main.with-navbar {
      padding-top: 76px;
      min-height: calc(100vh - 76px);
    }
  `]
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  showNavbar = false;

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar = this.authService.isLoggedIn() && 
                         !event.url.includes('/login') && 
                         !event.url.includes('/signup');
      });

    // Check initial state
    this.showNavbar = this.authService.isLoggedIn() && 
                     !this.router.url.includes('/login') && 
                     !this.router.url.includes('/signup');
  }
}