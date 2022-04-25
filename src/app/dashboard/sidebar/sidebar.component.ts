import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { NbMenuItem, NbMenuService } from "@nebular/theme"


@Component({
  selector: 'app-sidebar',
  template: '<nb-menu [items]="menu"></nb-menu>'
})
export class SidebarComponent {

  menu: NbMenuItem[]  = [
    {
      title: 'Home',
      icon: {icon: 'home', pack:'fa'},
      link: '/dashboard',
      home: true,
    },
    {
      title: 'Twitch',
      icon: {icon: 'twitch', pack:'fab'},
      children: [
        {
          title: 'API',
          icon: {icon: 'link', pack: 'fa'},
          link: 'twitch/api',
        },
        {
          title: 'Web source',
          icon: {icon: 'film', pack: 'eva'},
          link: 'twitch/elements',
        },
        {
          title: 'Hype Train',
          icon: {icon: 'train', pack: 'fa'},
          url: '/websource/hypetrain',
          target: '_blank',
        },
        {
          title: 'Chatbot',
          icon: {icon: 'swatchbook', pack: 'fa'},
          link: 'twitch/chatbot',
        }
      ]
    },
    {
      title: 'Discord',
      icon: {icon: 'discord', pack:'fab'},
      children: [
        {
          title: 'API',
          icon: {icon: 'link', pack: 'fa'},
          link: 'discord/api',
        },
        {
          title: 'Functions',
          icon: {icon: 'swatchbook', pack: 'fa'},
          link: 'discord/functions',
        },
      ]
    }
  ]

  constructor(private menuService: NbMenuService, private router: Router) {}

}