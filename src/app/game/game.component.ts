import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SocketIoService } from '../core/socket-io.service';
import { FieldBarComponent } from '../game-field/field-bar/field-bar.component';
import { AdBarsDirective } from './ad-bars.directive';
import { FieldChangerService } from './field-changer.service';
import { GameOverDialogComponent } from './game-over-dialog/game-over-dialog.component';
import { GameStateService } from './game-state.service';

interface FieldConfig {
  isBusy: boolean,
  shipType: number,
  index: number,
  isRootPosition: boolean,
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
  private _shipClickedSubs: Subscription[] = [];
  private _runningGameSub: Subscription;
  private _turnSub: Subscription;
  private _endGameSub: Subscription;
  private _roomId: string;
  public isYourTurn: boolean;

  constructor(
    private _gameStateService: GameStateService,
    private _renderer: Renderer2,
    private _fieldChangerService: FieldChangerService,
    private _socketService: SocketIoService,
    private _dialog: MatDialog,
    private _activatedRoute: ActivatedRoute,
    private _router: Router) {
    this._roomId = _activatedRoute.snapshot.params['id'];
    this.isYourTurn = _gameStateService.isYourTurn;
  }
  ngOnInit() {
    this._socketService.registerGameEvents();
    this._turnSub = this._gameStateService.turnChange$.subscribe(isYourTurn => {
      this.isYourTurn = isYourTurn;
    });
    if (this._gameStateService.gameWasGoing) {
      if (!this._gameStateService.enemyField || !this._gameStateService.playerField) {
        this._socketService.requestEnemyData();
      }
      this._socketService.askForFieldsInRunningGame();
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
    this._fieldChangerService.enemyFieldRef = this.enemyField.elementRef.nativeElement;
    this._fieldChangerService.playerFieldRef = this.playerField.elementRef.nativeElement;
    const playerFieldRef = this.adBars.first.viewContainerRef;
    const enemyFieldRef = this.adBars.last.viewContainerRef;
    this._loadPlayerFieldComponents(playerFieldRef);
    this._loadEnemyFieldComponents(enemyFieldRef);
    this._runningGameSub = this._socketService.runningGame$.subscribe((data: { enemyField: any, playerField: any, isYourTurn: boolean }) => {
      this._gameStateService.isYourTurn = data.isYourTurn;
      this._fieldChangerService.addCrossesAndWavesToField(data.enemyField, this.enemyField.elementRef.nativeElement);
      this._fieldChangerService.addCrossesAndWavesToField(data.playerField, this.playerField.elementRef.nativeElement);
    });
  }
  ngOnDestroy() {
    if (this._runningGameSub) {
      this._runningGameSub.unsubscribe();
    }
    this._turnSub.unsubscribe();
    this._shipClickedSubs.forEach(barSub => barSub.unsubscribe());
    this._endGameSub.unsubscribe();
    this._socketService.removeGameEvents(this._roomId);
  }
  private _loadPlayerFieldComponents(viewContainerRef: ViewContainerRef) {
    const playerFieldConfig: FieldConfig[] = this._gameStateService.playerField;

    for (let i = 0; i < 100; i++) {
      const barConfig = playerFieldConfig.find(barConfig => barConfig.index === i);
      if (!barConfig || !barConfig.isRootPosition) {
        viewContainerRef.createComponent(FieldBarComponent);
      } else {
        viewContainerRef.createComponent(FieldBarComponent, {
          projectableNodes: [[this._getImageNode(barConfig)]]
        });
      }
    }
  }
  private _loadEnemyFieldComponents(viewContainerRef: ViewContainerRef) {
    const enemyFieldConfig = this._gameStateService.enemyField;

    for (let i = 0; i < 100; i++) {
      const componentRef = viewContainerRef.createComponent(FieldBarComponent);
      const barConfig = enemyFieldConfig.find((barConfig: any) => barConfig.index === i) ?? null;
      componentRef.instance.data = barConfig;
      if (barConfig) {
        this._shipClickedSubs.push(componentRef.instance.barClicked.subscribe(_ => this._gameStateService.isGameOver(this.enemyField.elementRef.nativeElement, '_enemyFieldConfig')));
      }
    }
  }
  private _getImageConfigByNumber(shipNum: number): { src: string, width: number, height: number } {
    switch (shipNum) {
      case 1:
      case 2:
      case 3:
        return {
          src: 'assets/ships/1place_ship.png',
          width: 70,
          height: 80
        };
      case 4:
      case 5:
        return {
          src: 'assets/ships/2place_ship.png',
          width: 80,
          height: 140
        };
      case 6:
      case 7:
        return {
          src: 'assets/ships/3place_ship.png',
          width: 70,
          height: 220
        };
      default:
        return {
          src: 'assets/ships/4place_ship.png',
          width: 65,
          height: 300
        };
    }
  }
  private _getImageNode(barConfig: any) {
    const imgNode: HTMLImageElement = this._renderer.createElement('img');
    const imageConfig = this._getImageConfigByNumber(barConfig.shipType);
    imgNode.src = imageConfig.src;
    imgNode.height = imageConfig.height;
    imgNode.width = imageConfig.width;
    imgNode.draggable = false;
    if (barConfig.oriantation === 'horizontal') {
      imgNode.style.transform = 'rotate(-90deg)';
    }
    return imgNode;
  }
}
