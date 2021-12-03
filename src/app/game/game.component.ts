import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { SocketIoService } from '../core/socket-io.service';
import { FieldBarComponent } from '../game-field/field-bar/field-bar.component';
import { AdBarsDirective } from './ad-bars.directive';
import { FieldChangerService } from './field-changer.service';
import { GameOverDialogComponent } from './game-over-dialog/game-over-dialog.component';
import { GameStateService } from '../core/game-state.service';

export interface FieldConfig {
  isBusy: boolean,
  shipType: number,
  index: number,
  isRootPosition?: boolean,
  oriantation: string
}

@Component({
  selector: 'sea-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren(AdBarsDirective) adBars: QueryList<AdBarsDirective>;
  @ViewChild('player') playerField: any;
  @ViewChild('enemy') enemyField: any;
  private _joinGame$: Observable<any>;
  private _shipClickedSubs: Subscription[] = [];
  private _runningGameSub: Subscription;
  private _turnSub: Subscription;
  private _endGameSub: Subscription;
  public isYourTurn: boolean;

  constructor(
    private _gameStateService: GameStateService,
    private _fieldChangerService: FieldChangerService,
    private _socketService: SocketIoService,
    private _dialog: MatDialog,
    private _router: Router) {
    this.isYourTurn = _gameStateService.isYourTurn;
  }
  ngOnInit() {
    this._socketService.registerGameEvents();
    this._turnSub = this._gameStateService.turnChange$.subscribe(isYourTurn => {
      this.isYourTurn = isYourTurn;
    });
    if (!this._gameStateService.playerField || !this._gameStateService.enemyField) {
      this._socketService.requestEnemyData();
      this._joinGame$ = this._socketService.getGameStateInRunningGame$.pipe(
        switchMap(fieldConfigs => {
          this._socketService.askForFieldsInRunningGame();
          this._gameStateService.gameWasGoing = true;
          this._gameStateService.enemyField = fieldConfigs[0];
          this._gameStateService.playerField = fieldConfigs[1];
          return this._socketService.joinRunningGame$;
        })
      );
    } else {
      if (this._gameStateService.gameWasGoing) {
        this._socketService.askForFieldsInRunningGame();
        this._joinGame$ = this._socketService.joinRunningGame$;
      }
    }
    this._endGameSub = this._gameStateService.endGame$
      .pipe(filter(result => !!result)).subscribe(result => {
        const dialogRef = this._dialog.open(GameOverDialogComponent, {
          data: {
            title: result.includes('won') ? `Congratulations, ${result}!` : `Unlucky, ${result}.`
          }
        });
        dialogRef.afterClosed().subscribe(_ => {
          this._router.navigate(['/home']);
        })
      });
  }
  ngAfterViewInit(): void {
    if (this._joinGame$) {
      this._runningGameSub = this._joinGame$.subscribe(data => {
        this._instantiateFields();
        this._gameStateService.isYourTurn = data.isYourTurn;
        this._fieldChangerService.addCrossesAndWavesToField(data.enemyField, this.enemyField.elementRef.nativeElement);
        this._fieldChangerService.addCrossesAndWavesToField(data.playerField, this.playerField.elementRef.nativeElement);
        this._fieldChangerService.addFullyShotShipsToEnemyField();
      })
    } else {
      this._instantiateFields();
    }
  }
  private _instantiateFields() {
    this._fieldChangerService.enemyFieldRef = this.enemyField.elementRef.nativeElement;
    this._fieldChangerService.playerFieldRef = this.playerField.elementRef.nativeElement;
    this._loadPlayerFieldComponents(this.adBars.first.viewContainerRef);
    this._loadEnemyFieldComponents(this.adBars.last.viewContainerRef);
  }
  ngOnDestroy() {
    if (this._runningGameSub) {
      this._runningGameSub.unsubscribe();
    }
    this._turnSub.unsubscribe();
    this._shipClickedSubs.forEach(barSub => barSub.unsubscribe());
    this._endGameSub.unsubscribe();
    this._socketService.removeGameEvents();
  }
  private _loadPlayerFieldComponents(viewContainerRef: ViewContainerRef) {
    const playerFieldConfig: FieldConfig[] = this._gameStateService.playerField;

    for (let i = 0; i < 100; i++) {
      const barConfig = playerFieldConfig.find(barConfig => barConfig.index === i);
      if (!barConfig || !barConfig.isRootPosition) {
        viewContainerRef.createComponent(FieldBarComponent);
      } else {
        const img = this._fieldChangerService.getImageNode(barConfig);
        if (barConfig.oriantation === 'horizontal') {
          img.style.transform = 'rotate(-90deg)';
        }
        viewContainerRef.createComponent(FieldBarComponent, {
          projectableNodes: [[img]]
        });
      }
    }
  }
  private _loadEnemyFieldComponents(viewContainerRef: ViewContainerRef) {
    const enemyFieldConfig = this._gameStateService.enemyField;

    for (let i = 0; i < 100; i++) {
      const componentRef = viewContainerRef.createComponent(FieldBarComponent);
      const barConfig: FieldConfig = enemyFieldConfig.find((barConfig: any) => barConfig.index === i) ?? null;
      componentRef.instance.data = barConfig;
      if (barConfig) {
        this._shipClickedSubs.push(componentRef.instance.barClicked.pipe(
          tap(_ => {
            if (this._fieldChangerService.checkIfShipDestroyed(barConfig)) {
              this._fieldChangerService.prependImageToEnemyField(barConfig);
            }
          })
        ).subscribe(_ => this._gameStateService.isGameOver(this.enemyField.elementRef.nativeElement, '_enemyFieldConfig')));
      }
    }
  }
}
