import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupRoutingModule } from './setup-routing.module';
import { SetupComponent } from './setup.component';
import { SharedModule } from '../shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GameFieldModule } from '../game-field/game-field.module';
import { ShipComponent } from './ship/ship.component';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ShowHideTextDirective } from './show-hide-text.directive';
import { JoinRoomGuard } from './join-room.guard';

@NgModule({
  declarations: [SetupComponent, ShipComponent, ShowHideTextDirective],
  imports: [
    CommonModule,
    SetupRoutingModule,
    SharedModule,
    DragDropModule,
    GameFieldModule,
    MatIconModule,
    ClipboardModule
  ],
  providers: [JoinRoomGuard]
})
export class SetupModule { }
