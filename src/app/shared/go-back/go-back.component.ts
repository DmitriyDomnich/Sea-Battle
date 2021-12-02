import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GoBackDialogComponent } from '../go-back-dialog/go-back-dialog.component';


@Component({
  selector: 'sea-go-back',
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss']
})
export class GoBackComponent {

  constructor(
    private _router: Router,
    private _dialog: MatDialog) { }

  public goHome() {
    const dialogRef = this._dialog.open(GoBackDialogComponent);
    dialogRef.afterClosed().subscribe((isStay: boolean) => {
      if (isStay) {
        this._router.navigate(['home']);
      }
    })
  }

}
