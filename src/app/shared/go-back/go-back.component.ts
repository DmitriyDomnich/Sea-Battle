import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketIoService } from 'src/app/core/socket-io.service';


@Component({
  selector: 'sea-go-back',
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss']
})
export class GoBackComponent {

  constructor(private _router: Router, private _socketService: SocketIoService, private _activatedRoute: ActivatedRoute) { }

  public goHome() {
    const roomId = this._router.url;
    if (roomId.includes('game')) {
      this._socketService.leaveRoom(this._activatedRoute.snapshot.paramMap.get('id'));
    } else {
      this._socketService.leaveSetupRoom(this._activatedRoute.snapshot.paramMap.get('id'));
    }
    this._router.navigate(['home']);
  }

}
