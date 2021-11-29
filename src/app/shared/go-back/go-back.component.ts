import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketIoService } from 'src/app/core/socket-io.service';
import { GoBackDialogComponent } from '../go-back-dialog/go-back-dialog.component';


@Component({
  selector: 'sea-go-back',
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss']
})
export class GoBackComponent {

  constructor(
    private _router: Router,
    private _socketService: SocketIoService,
    private _activatedRoute: ActivatedRoute,
    private _dialog: MatDialog) { }

  public goHome() {
    const dialogRef = this._dialog.open(GoBackDialogComponent);
    dialogRef.afterClosed().subscribe((isStay: boolean) => {
      if (isStay) {
        const roomId = this._router.url;
        if (roomId.includes('game')) {
          this._socketService.leaveRoom(this._activatedRoute.snapshot.paramMap.get('id'));
        } else {
          this._socketService.leaveSetupRoom(this._activatedRoute.snapshot.paramMap.get('id'));
        }
        this._router.navigate(['home']);
      }
    })
  }

}
