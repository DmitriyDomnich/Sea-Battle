import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'game', loadChildren: () => import('./game/game.module').then(m => m.GameModule) },
  { path: 'setup', loadChildren: () => import('./setup/setup.module').then(m => m.SetupModule) },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
