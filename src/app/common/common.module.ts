import { NgModule } from "@angular/core"
import { SharedNebularModule } from "../shared/nebular.module"
import { FooterComponent } from "./footer/footer.component"
import { HeaderComponent } from "./header/header.component"
import { UploadComponent } from "./upload/upload.component"

@NgModule({
  imports: [
    SharedNebularModule,
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    UploadComponent,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    UploadComponent,
  ]
})
export class CommonModule { }