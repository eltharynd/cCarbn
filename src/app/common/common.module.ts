import { NgModule } from "@angular/core"
import { CommonModule as AngularCommonModule } from "@angular/common"
import { SharedNebularModule } from "../shared/nebular.module"
import { FooterComponent } from "./footer/footer.component"
import { HeaderComponent } from "./header/header.component"

@NgModule({
  imports: [
    AngularCommonModule,
    SharedNebularModule,
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
  ]
})
export class CommonModule { }