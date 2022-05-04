import { Component, OnInit, } from '@angular/core'
import { Title, Meta, MetaDefinition } from '@angular/platform-browser'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { NbIconLibraries } from '@nebular/theme'
import { filter, map } from 'rxjs'
import { DataService } from './shared/data.service'


@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  title = 'cCarbn'

  evaIcons = [];

  constructor(private data: DataService, private iconsLibrary: NbIconLibraries, private router: Router, private titleService: Title, private metaService: Meta) {

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
  ngOnInit(): void {
      this.router.events.pipe(
        filter((event => event instanceof NavigationEnd)),
        map(() => {
          let route: ActivatedRoute = this.router.routerState.root
          let routeData: any = {

          }
          while(route!.firstChild)
            route = route.firstChild
          if(route.snapshot.data['title'])
            routeData.title = route!.snapshot.data['title']
          if(route.snapshot.data['description'])
            routeData.description = route!.snapshot.data['description']
          return routeData
        })
      )
      .subscribe((routeData: any) => {
        if(routeData.title) {
          this.titleService.setTitle(`cCarbn - ${routeData.title}`)
          this.metaService.updateTag({name:'og:title', content: `cCarbn - ${routeData.title}`})
        } else {
          this.titleService.setTitle(`cCarbn`)
          this.metaService.updateTag({name:'og:title', content: `cCarbn`})
        }
        if(routeData.description) {
          this.metaService.updateTag({name:'description', content: routeData.description})
          this.metaService.updateTag({name:'og:description', content: routeData.description})
        } else {
          this.metaService.updateTag({name:'og:description', content: `cCarbn is a cloud based All-in-One bot that allows you to interact with Twitch events and chat via Browser Source ready dynamic pages and chat.`})
          this.metaService.updateTag({name:'og:description', content: `cCarbn is a cloud based All-in-One bot that allows you to interact with Twitch events and chat via Browser Source ready dynamic pages and chat.`})
        }
      })
  }

}
