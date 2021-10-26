import { NgModule } from "@angular/core";
import { GoBackComponent } from "./go-back/go-back.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [MatButtonModule, MatIconModule],
    declarations: [GoBackComponent],
    exports: [GoBackComponent]
})
export class SharedModule { }