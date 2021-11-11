import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupRoutingModule } from './setup-routing.module';
import { SetupComponent } from './setup.component';
import { SharedModule } from '../shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GameFieldModule } from '../game-field/game-field.module';
import { ShipComponent } from './ship/ship.component';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [SetupComponent, ShipComponent],
  imports: [
    CommonModule,
    SetupRoutingModule,
    SharedModule,
    DragDropModule,
    GameFieldModule,
    MatIconModule
  ]
})
export class SetupModule { }
