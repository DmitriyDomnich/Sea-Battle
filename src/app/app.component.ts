import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { SocketIoService } from './core/socket-io.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private _roomId: string;
  private _isSetupPage: boolean;
  private _connectionErrorSub: Subscription;
  private _connectionSuccessSub: Subscription;

  constructor(
    private _socketService: SocketIoService,
    private _router: Router,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this._socketService.registerSocketIoConnection();
    this._connectionErrorSub = this._getErrorSub();
    this._connectionSuccessSub = this._getSuccessSub();

    this._router.events.pipe(filter((ev: RouterEvent) => ev instanceof NavigationEnd))
      .subscribe(ev => {
        const lastLetters = ev.url.slice(-8);
        if (!lastLetters.includes('/') && !lastLetters.includes('?') && this._roomId !== lastLetters) {
          this._roomId = lastLetters;
          if (ev.url.slice(1, 6) === 'setup') {
            this._isSetupPage = true;
          }
        } else {
          if (this._isSetupPage && ev.url.slice(1, 5) === 'game') {
            this._isSetupPage = false;
          } else if (this._isSetupPage && ev.url.slice(1, 5) === 'home') {
            if (this._roomId) {
              this._socketService.leaveRoom(this._roomId, true);
              this._roomId = null;
            }
          } else {
            if (this._roomId) {
              this._socketService.leaveRoom(this._roomId);
              this._roomId = null;
            }
          }
        }
      });
  }
  private _getErrorSub() {
    return this._socketService.connectionError$.subscribe(_ => {
      if (!this._router.url.includes('home')) {
        this._router.navigate(['/home']);
      }
      this._snackBar.open("Error. Server doesn't respond.", '', {
        duration: 2000,
        panelClass: 'snack-bar',
      });

      this._connectionErrorSub.unsubscribe();
      this._connectionSuccessSub = this._getSuccessSub();
    });
  }
  private _getSuccessSub() {
    return this._socketService.connectionSuccess$.subscribe(_ => {
      this._connectionSuccessSub.unsubscribe();
      this._connectionErrorSub = this._getErrorSub();
    });
  }
}
