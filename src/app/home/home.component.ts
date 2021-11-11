import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { v4 as createCode } from 'uuid';
import { SocketIoService } from '../core/socket-io.service';
import { GameStateService } from '../game/game-state.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router,
    private _gameState: GameStateService,
    private _socketService: SocketIoService,
    private _snackBar: MatSnackBar,
    private _router: Router) { }
  ngOnInit() {
    this._router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(ev => {
      console.log(ev);
    });
    this._gameState.resetState();
  }
  public startNewGame() {
    const code = createCode().slice(0, 8);
    this._socketService.registerSocketIoConnection();
    this._socketService.createRoom(code);
    this.router.navigate(['setup', code]);
  }
  public joinExistingGame(code: string) {
    this._socketService.registerSocketIoConnection();
    this._socketService.joinRoom(code);
    this._socketService.joinRoom$
      .subscribe(result => {
        if (typeof (result) === 'boolean') {
          this.router.navigate(['setup', code]);
        } else {
          this._snackBar.open(result, 'Ok', {
            duration: 2000
          });
        }
      });
  }
}
