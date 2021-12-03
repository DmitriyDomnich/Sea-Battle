import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { SocketIoService } from 'src/app/core/socket-io.service';
import { FieldChangerService } from 'src/app/game/field-changer.service';
import { GameStateService } from 'src/app/core/game-state.service';

@Component({
  selector: 'sea-field-bar',
  templateUrl: './field-bar.component.html',
  styleUrls: ['./field-bar.component.scss']
})
export class FieldBarComponent implements OnInit {
  @Input() data: any;
  @Output() barClicked = new EventEmitter<void>();
  @HostBinding('class') className: string;
  private _index: number;
  private _clicked = false;

  @HostListener('click') onClick() {
    if (!this._clicked && (this.data || this.data === null)
      && this._gameStateService.isYourTurn && !this._el.nativeElement.children.length) {
      if (this.data?.isBusy) {
        this._fieldChangerService.shootEnemyShip(this._index);
        this._socketService.shootEnemyShip(this._index);
      } else {
        this._gameStateService.isYourTurn = false;
        this._fieldChangerService.shootEnemyNothing(this._index);
        this._socketService.shootEnemyNothing(this._index);
      }
      this._clicked = true;
      this._resetBarStyles();
      this.barClicked.emit();
    }
  }
  @HostListener('mouseenter') onHover() {
    if ((this.data || this.data === null) && !this._el.nativeElement.children.length) {
      this._el.nativeElement.style.backgroundColor = '#F7A1C4'
      this._el.nativeElement.style.cursor = 'pointer';
    }
  }
  @HostListener('mouseleave') onLeave() {
    this._el.nativeElement.style.backgroundColor = 'transparent';
  }
  private _resetBarStyles() {
    this._el.nativeElement.style.backgroundColor = 'initial';
    this._el.nativeElement.style.cursor = 'initial';
  }
  private _setBarClass() {
    this.className = '';
    if (this._index < 10) {
      this.className += 'top-no-borders';
    }
    if (this._index > 89) {
      this.className += ' bottom-no-borders';
    }
    if (this._index.toString().slice(-1) === '0') {
      this.className += ' left-no-borders';
    }
    if (this._index.toString().slice(-1) === '9') {
      this.className += ' right-no-borders';
    }

  }
  constructor(
    private _el: ElementRef<HTMLDivElement>,
    private _gameStateService: GameStateService,
    private _fieldChangerService: FieldChangerService,
    private _socketService: SocketIoService
  ) {
  }
  ngOnInit() {
    this._index = Array.from(this._el.nativeElement.parentElement.children).indexOf(this._el.nativeElement);
    this._setBarClass();
  }
}
