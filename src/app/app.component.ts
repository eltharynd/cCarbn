import { Component, } from '@angular/core'
import { NbIconLibraries } from '@nebular/theme'
import { DataService } from './shared/data.service'


@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  title = 'cCarbn'

  evaIcons = [];

  constructor(private data: DataService, private iconsLibrary: NbIconLibraries) {

    iconsLibrary.registerFontPack('eva', { packClass: 'eva', iconClassPrefix: 'eva' })
    iconsLibrary.setDefaultPack('eva')
    iconsLibrary.registerFontPack('nebular', { packClass: 'nb', iconClassPrefix: 'nb' })

    //Solid
    iconsLibrary.registerFontPack('fa', { packClass: 'fa', iconClassPrefix: 'fa' })
    //Regular (Pro Required)
    //iconsLibrary.registerFontPack('far', { packClass: 'far', iconClassPrefix: 'fa' })
    //Light (Pro Required)
    //iconsLibrary.registerFontPack('fal', { packClass: 'fal', iconClassPrefix: 'fa' })
    //Light (Pro Required)
    //iconsLibrary.registerFontPack('fal', { packClass: 'fal', iconClassPrefix: 'fa' })
    //Duotone (Pro Required)
    //iconsLibrary.registerFontPack('fad', { packClass: 'fad', iconClassPrefix: 'fa' })
    //Brands
    iconsLibrary.registerFontPack('fab', { packClass: 'fab', iconClassPrefix: 'fa' })

  }


}
