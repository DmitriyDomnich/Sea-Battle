import { Component, OnInit } from '@angular/core';
import { Bar } from '../models/bar';

@Component({
  selector: 'sea-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor() { }
  public bars: Bar[] = new Array<Bar>(100);

  ngOnInit(): void {
  }

}
