import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'sea-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent implements OnInit {

  constructor(
    public elementRef: ElementRef
  ) { }

  ngOnInit(): void {
  }

}
