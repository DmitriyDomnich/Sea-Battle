import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JoinRoomGuard } from './join-room.guard';
import { SetupComponent } from './setup.component';

const routes: Routes = [
  { path: ':id', component: SetupComponent, canActivate: [JoinRoomGuard] },
  { path: '', pathMatch: 'full', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }
