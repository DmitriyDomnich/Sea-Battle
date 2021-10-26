import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'sea-go-back',
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss']
})
export class GoBackComponent {

  constructor(private router: Router) { }

  public goHome() {
    this.router.navigate(['home']);
  }

}
