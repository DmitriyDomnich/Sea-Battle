import { NgModule } from "@angular/core";
import { GoBackComponent } from "./go-back/go-back.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { GoBackDialogComponent } from './go-back-dialog/go-back-dialog.component';
import { TurnDeviceComponent } from './turn-device/turn-device.component';

@NgModule({
    imports: [MatButtonModule, MatIconModule, MatDialogModule],
    declarations: [GoBackComponent, GoBackDialogComponent, TurnDeviceComponent],
    exports: [GoBackComponent, MatButtonModule, MatSnackBarModule, TurnDeviceComponent]
})
export class SharedModule { }