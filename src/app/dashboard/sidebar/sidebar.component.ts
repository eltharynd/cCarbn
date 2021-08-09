import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { NbMenuItem, NbMenuService } from "@nebular/theme"


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {

  menu: NbMenuItem[]  = [
    {
      title: 'Home',
      icon: 'home-outline',
      link: '/dashboard',
      home: true,
    },
    {
      title: 'Twitch',
      icon: 'layers-outline',
      link: 'twitch',
      children: [
        {
          title: 'API',
          icon: 'layers-outline',
          link: 'twitch/api',
        },
        {
          title: 'Chatbot',
          icon: 'layers-outline',
          link: 'twitch/chatbot',
        }
      ]
    },
    {
      title: 'Discord',
      icon: 'layers-outline',
      link: 'discord',
      children: [
        {
          title: 'API',
          icon: 'layers-outline',
          link: 'discord/api',
        },
        {
          title: 'Functions',
          icon: 'layers-outline',
          link: 'discord/functions',
        },
      ]
    }
  ]

  constructor(private menuService: NbMenuService, private router: Router) {
    this.menuService.onSubmenuToggle().subscribe(({ item }) => {
      if(item.expanded)
        this.router.navigate([`/dashboard/${item.link}`])
    })
  }

}