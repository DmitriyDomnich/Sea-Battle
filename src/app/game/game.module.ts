import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRoutingModule } from './game-routing.module';
import { SharedModule } from '../shared/shared.module';
import { GameComponent } from './game.component';
import { GameFieldModule } from '../game-field/game-field.module';
import { AdBarsDirective } from './ad-bars.directive';
import { MatDialogModule } from '@angular/material/dialog';
import { GameOverDialogComponent } from './game-over-dialog/game-over-dialog.component';
import { JoinGameGuard } from './join-game.guard';


@NgModule({
  declarations: [GameComponent, AdBarsDirective, GameOverDialogComponent],
  imports: [
    CommonModule,
    GameRoutingModule,
    SharedModule,
    GameFieldModule,
    MatDialogModule
  ],
  providers: [JoinGameGuard]
})
export class GameModule { }
