import { Component, } from '@angular/core'
import { NbIconLibraries } from '@nebular/theme'
import { DataService } from './shared/data.service'


@Component({
  selector: 'app-root',
  template: `<div><router-outlet></router-outlet></div>`
})
export class AppComponent {
  title = 'elthabot'

  evaIcons = [];

  constructor(private data: DataService, private iconsLibrary: NbIconLibraries) {

    iconsLibrary.registerFontPack('eva', { packClass: 'eva', iconClassPrefix: 'eva' })
    iconsLibrary.setDefaultPack('eva')

    iconsLibrary.registerFontPack('nebular', { packClass: 'nb', iconClassPrefix: 'nb' })

    iconsLibrary.registerFontPack('fa', { packClass: 'fa', iconClassPrefix: 'fa' })
    iconsLibrary.registerFontPack('far', { packClass: 'far', iconClassPrefix: 'fa' })

  }


}
