import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NbMediaBreakpointsService, NbMenuItem, NbMenuService, NbSidebarService } from '@nebular/theme'
import { DeviceDetectorService } from 'ngx-device-detector'

@Component({
  selector: 'app-sidebar',
  template: '<nb-menu [items]="menu"></nb-menu>',
})
export class SidebarComponent {
  menu: NbMenuItem[] = [
    {
      title: 'Dashboard',
      icon: { icon: 'home', pack: 'fa' },
      link: '/dashboard',
      home: true,
    },
    {
      title: 'Twitch',
      icon: { icon: 'twitch', pack: 'fab' },
      link: '/dashboard/twitch',
      children: [
        {
          title: 'API',
          icon: { icon: 'link', pack: 'fa' },
          link: '/dashboard/twitch/api',
        },
        {
          title: 'Alerts',
          icon: { icon: 'film', pack: 'eva' },
          link: '/dashboard/twitch/alerts',
        },
        {
          title: 'Stream Deck',
          icon: { icon: 'keypad-outline', pack: 'eva' },
          link: '/dashboard/twitch/streamdeck',
        },
        {
          title: 'Hype Train',
          icon: { icon: 'train', pack: 'fa' },
          link: '/dashboard/twitch/hypetrain',
        },
        {
          title: 'Chat Commands',
          icon: { icon: 'swatchbook', pack: 'fa' },
          link: '/dashboard/twitch/chatbot',
        },
      ],
    },
    {
      title: 'Discord',
      icon: { icon: 'discord', pack: 'fab' },
      link: '/dashboard/discord',
      children: [
        {
          title: 'API & Connections',
          icon: { icon: 'link', pack: 'fa' },
          link: '/dashboard/discord/api',
        },
        {
          title: 'Functions',
          icon: { icon: 'swatchbook', pack: 'fa' },
          link: '/dashboard/discord/functions',
        },
      ],
    },
  ]

  constructor(private menuService: NbMenuService, private device: DeviceDetectorService, private sidebarService: NbSidebarService) {
    this.menuService.onItemClick().subscribe((ev) => {
      if (!this.device.isDesktop()) this.sidebarService.collapse()
    })
  }
}
