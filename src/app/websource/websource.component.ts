import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-websource',
  templateUrl: './websource.component.html',
  styleUrls: ['./websource.component.scss']
})
export class WebsourceComponent implements OnInit {


  predictions: any
  hypeTrain: any = {}

  constructor() { }

  ngOnInit(): void {
  }

}
