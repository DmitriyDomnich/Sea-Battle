import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldComponent } from './field/field.component';
import { FieldBarComponent } from './field-bar/field-bar.component';
import { MatRippleModule } from '@angular/material/core';


@NgModule({
  declarations: [FieldComponent, FieldBarComponent],
  imports: [
    CommonModule,
    MatRippleModule
  ],
  exports: [FieldComponent, FieldBarComponent]
})
export class GameFieldModule { }
