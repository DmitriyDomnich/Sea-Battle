import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldComponent } from './field/field.component';
import { FieldBarComponent } from './field-bar/field-bar.component';
import { MatRippleModule } from '@angular/material/core';
import { CrossDirective } from './crossed.directive';


@NgModule({
  declarations: [FieldComponent, FieldBarComponent, CrossDirective],
  imports: [
    CommonModule,
    MatRippleModule
  ],
  exports: [FieldComponent]
})
export class GameFieldModule { }
