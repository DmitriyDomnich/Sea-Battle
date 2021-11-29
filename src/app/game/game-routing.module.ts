import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './game.component';
import { JoinGameGuard } from './join-game.guard';

const routes: Routes = [
  { path: ':id', component: GameComponent, canActivate: [JoinGameGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
