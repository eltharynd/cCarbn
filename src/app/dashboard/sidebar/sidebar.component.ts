import { Component } from "@angular/core"
import { NbMenuItem } from "@nebular/theme"


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
      expanded: true,
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

}