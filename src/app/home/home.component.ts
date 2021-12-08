import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { from, Subscription } from 'rxjs';
import { v4 as createCode } from 'uuid';
import { SocketIoService } from '../core/socket-io.service';
import { GameStateService } from '../core/game-state.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private _navigateSub: Subscription;

  constructor(private router: Router,
    private _gameState: GameStateService,
    private _socketService: SocketIoService,
    private _snackBar: MatSnackBar) { }
  ngOnInit() {
    this._showMessage();
    this._gameState.resetState();
  }
  ngOnDestroy() {
    if (this._navigateSub)
      this._navigateSub.unsubscribe();
  }
  public startNewGame() {
    const code = createCode().slice(0, 8);
    this._socketService.createRoom(code);
    this.router.navigate(['setup', code]);
  }
  public joinExistingGame(inviteLink: string) {
    const code = inviteLink.slice(-8);
    from(this.router.navigate(['setup', code])).subscribe(_ => {
      this._showMessage();
    });
  }
  private _showMessage() {
    const test: string = this.router.parseUrl(this.router.url).queryParams['err'];
    if (test) {
      const message = +test === 0 ? "Room doesn't exist." : "The room is full.";
      this._snackBar.open(message, 'Ok', {
        duration: 2000,
        panelClass: 'snack-bar',
      });
    }
  }
}
