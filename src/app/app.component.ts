import { Component, } from '@angular/core'
import { NbIconLibraries } from '@nebular/theme'
import { DataService } from './shared/data.service'

@Component({
  selector: 'app-root',
  template: `<div><router-outlet></router-outlet></div>`
})
export class AppComponent {
  title = 'elthabot'

  constructor(private data: DataService, private iconLibraries: NbIconLibraries) {
    iconLibraries.registerFontPack('font-aawesome', { iconClassPrefix: 'fa' })
  }

}
