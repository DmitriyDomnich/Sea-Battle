import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SocketIoService } from './core/socket-io.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private _roomId: string;
  private _isSetupPage: boolean;
  constructor(
    private _socketService: SocketIoService,
    private _router: Router
  ) {
  }

  ngOnInit() {
    this._socketService.registerSocketIoConnection();
    this._router.events.pipe(filter((ev: RouterEvent) => ev instanceof NavigationEnd))
      .subscribe(ev => {
        //console.log(ev);
        const lastLetters = ev.url.slice(-8);
        if (!lastLetters.includes('/') && !lastLetters.includes('?') && this._roomId !== lastLetters) {
          this._roomId = lastLetters;
          if (ev.url.slice(1, 6) === 'setup') {
            this._isSetupPage = true;
          }
          console.log(this._roomId);
        } else {
          if (this._isSetupPage && ev.url.slice(1, 5) === 'game') {
            this._isSetupPage = false;
            // console.log('not setup anymore');
          } else if (this._isSetupPage && ev.url.slice(1, 5) === 'home') {
            if (this._roomId) {
              this._socketService.leaveRoom(this._roomId, true);
              this._roomId = null;
              console.log('left setup room');
            }
          } else {
            if (this._roomId) {
              this._socketService.leaveRoom(this._roomId);
              this._roomId = null;
              console.log('left room');
            }
          }
        }
      });
  }
}
