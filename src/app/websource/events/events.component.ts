import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs'

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  viewport = {
    width: 1280,
    height: 720,
    background: false,
    dark: false
  }

  events: WebsourceEvent[] = []
  
  ngOnInit() {
    let id = 1
    setInterval(() => {
      let buffer = new WebsourceEvent(id++)
      this.queueUp(buffer)
    }, 1000)

    setInterval(() => {
      this.playNext()
    }, 5000)
  }

  
  queueUp(event: WebsourceEvent) {
    this.events.push(event)
    event.starting.subscribe((id) => console.log(`event ${id} starting`))
    event.ending.subscribe((id) => {
      console.log(`event ${id} ended`)
      this.playing = false;
      this.playNext()
    })
  }

  playing = false
  playNext() {
    if(this.playing || this.events.length<=0)
      return
    this.playing = true
    let buffer = this.events.splice(0, 1)[0]
    buffer.play()
  }

}

class WebsourceEvent implements Hookable {
  id

  starting = new Subject()
  ending = new Subject()

  constructor(id) {
    this.id = id
    console.log(`event ${this.id} created`)
  }

  play() {
    this.starting.next(this.id)
    let duration = Math.floor(Math.random() * 10) + 1
    setTimeout(() => {
      this.ending.next(this.id)
    }, duration * 1000);
  }

}
interface Hookable {
  starting: Subject<any>
  ending: Subject<any>
}