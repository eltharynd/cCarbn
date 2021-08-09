import { NgModule } from "@angular/core"
import { SharedNebularModule } from "../shared/nebular.module"
import { FooterComponent } from "./footer/footer.component"
import { HeaderComponent } from "./header/header.component"

@NgModule({
  imports: [
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