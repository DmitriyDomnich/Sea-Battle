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
  public shipStyles: any;

  constructor(private fieldInstaller: FieldInstallerService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.shipStyles = {
      width: this.shipConfig.width + 'px',
      height: this.shipConfig.height + 'px',
    };
  }
  public flip() {
    const bar = this.container.nativeElement.parentElement.parentElement;

    if (this.container.nativeElement.parentElement.parentElement.tagName !== 'DIV') {
      const shipData = this.shipConfig;
      const position = Array.from(bar.parentElement.children).indexOf(bar) + 1;

      if (this.fieldInstaller.isSafeFlip(bar, this.shipConfig, position)) {
        this.flipShip();
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
  private flipShip() {
    if (this.shipConfig.orientation === 'vertical') {
      this.shipConfig.orientation = 'horizontal';
      if (this.shipConfig.barsCount === 4 || this.shipConfig.barsCount === 2) {
        this.shipImg.nativeElement.style.transform = 'rotate(-90deg)'
      } else {
        Math.random() > 0.5
          ? this.shipImg.nativeElement.style.transform = 'rotate(90deg)'
          : this.shipImg.nativeElement.style.transform = 'rotate(-90deg)'
      }
    } else {
      this.shipConfig.orientation = 'vertical';
      this.shipImg.nativeElement.style.transform = 'unset';
    }
  }
}
