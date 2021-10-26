import { Component, OnInit } from '@angular/core';
import { Bar } from '../../models/bar';

@Component({
  selector: 'sea-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent implements OnInit {

  public bars: Bar[] = new Array<Bar>(100);

  constructor() { }

  ngOnInit(): void {
  }

}
