import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketIoService } from '../core/socket-io.service';
import { GameStateService } from '../game/game-state.service';
import { Ship } from '../models/ship';
import { FieldInstallerService } from './field-installer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  providers: [FieldInstallerService]
})
export class SetupComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('field') private _field: any;
  @ViewChild('wrapper') private _shipsContainer: ElementRef<HTMLDivElement>;
  private _messagesSubscription: Subscription;
  public someoneReady: string | undefined;
  public canSend = false;
  public inviteLink: string;
  public ships: Ship[] = [
    { id: 1, barsCount: 1, width: 70, height: 80, src: 'assets/ships/1place_ship.png' },
    { id: 2, barsCount: 1, width: 70, height: 80, src: 'assets/ships/1place_ship.png' },
    { id: 3, barsCount: 1, width: 70, height: 80, src: 'assets/ships/1place_ship.png' },
    { id: 4, barsCount: 2, width: 80, height: 140, src: 'assets/ships/2place_ship.png', bottomIndent: 65, orientation: 'vertical' },
    { id: 5, barsCount: 2, width: 80, height: 140, src: 'assets/ships/2place_ship.png', bottomIndent: 65, orientation: 'vertical' },
    { id: 6, barsCount: 3, width: 70, height: 220, src: 'assets/ships/3place_ship.png', orientation: 'vertical' },
    { id: 7, barsCount: 3, width: 70, height: 220, src: 'assets/ships/3place_ship.png', orientation: 'vertical' },
    { id: 8, barsCount: 4, width: 65, height: 300, src: 'assets/ships/4place_ship.png', bottomIndent: 75, orientation: 'vertical' },
  ];
  public bars: any[] = new Array(100).fill(0);

  constructor(private _renderer: Renderer2,
    private _fieldInstaller: FieldInstallerService,
    private _gameState: GameStateService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _socketService: SocketIoService) { }
  ngOnInit() {
    this.inviteLink = this._router.url;
    this._socketService.requestEnemyData();
    this._messagesSubscription = this._gameState.startGame$.subscribe({
      next: message => {
        if (typeof (message) === 'boolean') {
          this._router.navigate(['game', this._activatedRoute.snapshot.paramMap.get('id')]);
        } else if (typeof (message) === 'string') {
          if (!this.someoneReady)
            this.someoneReady = message;
        }
      }
    });
  }
  ngAfterViewInit() {
    this._fieldInstaller.fieldElement = this._field.elementRef.nativeElement;
  }
  ngOnDestroy() {
    this._messagesSubscription.unsubscribe();
  }
  public dragStart(event: any) {
    if (event.source.data.src.includes('2') || event.source.data.src.includes('4')) {
      event.source.element.nativeElement.style.marginTop = `-${event.source.data.bottomIndent}px`;
    }
  }
  public dragEnd(event: any) {
    // if (event.source.data.src.includes('2') || event.source.data.src.includes('4')) {
    //   event.source.element.nativeElement.style.marginTop = `unset`;
    // }
  }
  public canBePlaced(item: CdkDrag, target: CdkDropList<any>): boolean {
    if (target.element.nativeElement.children.length) {
      return false;
    }
    return true;
  }
  public drop(event: CdkDragDrop<Ship>) {
    const bar = event.container.element.nativeElement;
    const shipData = event.item.data;
    const itemPosition = Array.from(this._field.elementRef.nativeElement.children).indexOf(bar) + 1;

    if (this._fieldInstaller.isSafe(bar, shipData, itemPosition)) {
      this._renderer.appendChild(event.container.element.nativeElement, event.item.element.nativeElement);
      this._fieldInstaller.removeFilled();
      this._fieldInstaller.fillBars(bar, shipData, itemPosition);
    }
    if (!this._shipsContainer.nativeElement.children.length) {
      this.canSend = true;
    }
  }
  public flipped({ bar, shipData, position }) {
    this._fieldInstaller.removeFlippedBars(shipData.id);
    this._fieldInstaller.fillBars(bar, shipData, position);
  }
  public sendFieldConfig() {
    const fieldConfiguration = this._fieldInstaller.getBarsConfig();
    this._socketService.sendFieldConfiguration(fieldConfiguration, this._activatedRoute.snapshot.params['id']);
  }
}
