import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { GameStateService } from 'src/app/core/game-state.service';
import { SocketIoService } from 'src/app/core/socket-io.service';
import { TurnHandlerService } from '../turn-handler.service';

@Component({
  selector: 'sea-turn-timer',
  templateUrl: './turn-timer.component.html',
  styleUrls: ['./turn-timer.component.scss']
})
export class TurnTimerComponent implements OnInit, OnDestroy {
  seconds: number = 15;
  interval = interval(1000);
  private _intervalSubscription: Subscription;
  private _turnChangeSubscription: Subscription;
  private _gameStoppedSubscription: Subscription;
  private _enemyReturnedSubscription: Subscription;

  constructor(
    private _gameStateService: GameStateService,
    private _turnChangeService: TurnHandlerService,
    private _socketService: SocketIoService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this._enemyReturnedSubscription = this._socketService.enemyJoinedGame$.subscribe(_ => {
      this._turnChangeService.startTimer();
      this._resetSubscription(15);
    });
    this._gameStoppedSubscription = this._socketService.enemyLeftGame$.subscribe(_ => {
      this._snackBar.open('Enemy left the game.', '', {
        duration: 1000,
        panelClass: 'snack-bar'
      });
      this._turnChangeService.resetTimer();
      this._intervalSubscription.unsubscribe();
      this.seconds = 0;
    });
    this._intervalSubscription = this.interval.subscribe(_ => --this.seconds);
    this._turnChangeSubscription = this._gameStateService.turnChange$.subscribe(_ => {
      if (this._intervalSubscription) {
        this._intervalSubscription.unsubscribe();
      }
      this._resetSubscription(15);
    });
  }
  ngOnDestroy() {
    this._turnChangeSubscription.unsubscribe();
    this._intervalSubscription.unsubscribe();
    this._gameStoppedSubscription.unsubscribe();
    this._enemyReturnedSubscription.unsubscribe();
  }
  private _resetSubscription(time: number) {
    this.seconds = time;
    this._intervalSubscription = this.interval.subscribe(_ => --this.seconds);
  }
}
