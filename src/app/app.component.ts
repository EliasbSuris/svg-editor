import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ROUTES_PATH } from './app.routes';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'aor-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatSidenavModule, MatIconButton, MatIcon],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  public APP_PATHS = ROUTES_PATH;
  public title = 'svg-editor';
}
