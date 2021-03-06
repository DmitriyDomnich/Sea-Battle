import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnHandlerService {

  private _timer: Observable<number> = timer(15000);
  private _timerSubscription: Subscription;
  public turnChange$ = new Subject();

  constructor(
  ) { }
  startTimer() {
    this._timerSubscription = this._timer.subscribe(_ => {
      this.turnChange$.next();
    });
  }
  resetTimer() {
    if (this._timerSubscription)
      this._timerSubscription.unsubscribe();
  }
}
