import { NgModule } from "@angular/core"
import { SharedNebularModule } from "../shared/nebular.module"
import { FooterComponent } from "./footer/footer.component"
import { HeaderComponent } from "./header/header.component"
import { UploadComponent } from "./upload/upload.component";
import { PlainHeaderComponent } from './plain-header/plain-header.component'
import { RouterModule } from "@angular/router"

@NgModule({
  imports: [
    SharedNebularModule,
    RouterModule,
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    UploadComponent,
    PlainHeaderComponent,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    UploadComponent,
    PlainHeaderComponent,
  ]
})
export class CommonModule { }