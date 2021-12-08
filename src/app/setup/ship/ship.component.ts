import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Ship } from 'src/app/models/ship';
import { FieldInstallerService } from '../field-installer.service';

@Component({
  selector: 'sea-ship',
  templateUrl: './ship.component.html',
  styleUrls: ['./ship.component.scss']
})
export class ShipComponent implements OnInit {

  @Input() shipConfig: Ship;
  @Output() shipFlipped = new EventEmitter();
  @ViewChild('shipImage') shipImg: ElementRef<HTMLImageElement>;
  @ViewChild('container') container: ElementRef<HTMLDivElement>;

  constructor(private fieldInstaller: FieldInstallerService,
    private _snackBar: MatSnackBar,
    private _el: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    this._el.nativeElement.style.width = this.shipConfig.width + '%';
    this._el.nativeElement.style.height = this.shipConfig.height + '%';
  }
  public flip() {
    const bar = this.container.nativeElement.parentElement.parentElement;

    if (this.container.nativeElement.parentElement.parentElement.tagName !== 'DIV') {
      const shipData = this.shipConfig;
      const position = Array.from(bar.parentElement.children).indexOf(bar) + 1;

      if (this.fieldInstaller.isSafeFlip(bar, this.shipConfig, position)) {
        this.flipShip(true);
        this.shipFlipped.emit({ bar, shipData, position });
      } else {
        this._snackBar.open("You can't rotate the ship this way.", "Ok, I'm not stupid", {
          duration: 1000
        });
      }
    } else {
      this.flipShip();
    }
  }
  private flipShip(wasOnField?: boolean) {
    if (this.shipConfig.orientation === 'vertical') {
      this.shipConfig.orientation = 'horizontal';
      if (this.shipConfig.barsCount === 4 || this.shipConfig.barsCount === 2) {
        if (wasOnField) {
          this._el.nativeElement.classList.remove('margin-top');
          if (this.shipConfig.barsCount === 4) {
            this._el.nativeElement.classList.add('margin-left');
          } else {
            this._el.nativeElement.classList.add('margin-right');
          }
        }
        this.container.nativeElement.classList.add('flip-90');
      } else {
        Math.random() > 0.5
          ? this.container.nativeElement.classList.add('flip-90')
          : this.container.nativeElement.classList.add('flip90');
      }
    } else {
      this.shipConfig.orientation = 'vertical';
      if (wasOnField) {
        if (this.shipConfig.barsCount === 4 || this.shipConfig.barsCount === 2) {
          this._el.nativeElement.classList.add('margin-top');
        }
        this._el.nativeElement.classList.remove('margin-right', 'margin-left');
      }
      this.container.nativeElement.classList.remove('flip90', 'flip-90');
    }
  }
}
