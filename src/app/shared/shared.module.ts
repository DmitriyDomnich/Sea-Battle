import { NgModule } from "@angular/core";
import { GoBackComponent } from "./go-back/go-back.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
@NgModule({
    imports: [MatButtonModule, MatIconModule],
    declarations: [GoBackComponent],
    exports: [GoBackComponent, MatButtonModule, MatSnackBarModule]
})
export class SharedModule { }