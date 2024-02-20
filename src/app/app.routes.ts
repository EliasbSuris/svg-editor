import { Routes } from '@angular/router';

type AppRoutesPathName = 'SVG_EDITOR' | 'DEFAULT';

export const ROUTES_PATH: Record<AppRoutesPathName, string> = {
  DEFAULT: 'svg-editor',
  SVG_EDITOR: 'svg-editor',
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ROUTES_PATH.DEFAULT,
  },
  {
    path: ROUTES_PATH.SVG_EDITOR,
    loadChildren: () => import('./pages/svg-editor/svg-editor.routes'),
  },
];
