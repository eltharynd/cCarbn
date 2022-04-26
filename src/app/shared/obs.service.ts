import { Injectable } from '@angular/core';
import { filter, from, map, Subject, take, toArray } from 'rxjs'
import OBSWebSocket, { OBSRequestTypes, OBSEventTypes, EventSubscription } from 'obs-websocket-js';
import { DataService } from './data.service'
import { throws } from 'assert'

@Injectable({
  providedIn: 'root'
})
export class OBSService {

  private obsstudio
  private OBS

  currentScene: string 
  scenes: any[]
  sources: any[] 

  events: Subject<any> = new Subject()

  constructor(private data: DataService) { 
    //@ts-ignore
    if(window?.obsstudio) {
      //@ts-ignore
      this.obsstudio = window.obsstudio
      this.OBS = new OBSWebSocket()
      this.OBS.connect('ws://127.0.0.1:4455', undefined, EventSubscription.All).then(conn => {

        this.getItems().then(() => {
          this.data.socketIO.on('requestOBSlist', (data) => {
            if(data.userId)
              this.data.send('sendOBSlist', {
                userId: data.userId,
                response: {
                  currentScene: this.currentScene,
                  scenes: this.scenes,
                  sources: this.sources
                }
              })
          })
        })

        this.OBS.on('ConnectionOpened ', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneCreated', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneRemoved', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneNameChanged', (event) => {
          this.getItems()
        })
        this.OBS.on('CurrentProgramSceneChanged', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneListChanged', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneItemCreated', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneItemRemoved', (event) => {
          this.getItems()
        })
        this.OBS.on('SceneItemListReindexed', (event) => {
          this.getItems()
        })
      })
    }

    this.data.socketIO.on('receiveOBSlist', (data) => {
      this.currentScene = data.currentScene
      this.scenes = data.scenes
      this.sources = data.sources
    })
  }

  private async getItems() {
    this.OBS.call('GetSceneList').then(response => {
      this.currentScene = response.currentProgramSceneName
      this.scenes = response.scenes
    })  

    this.OBS.call('GetInputList').then(response => {    
      this.sources = response.inputs
      this.OBS.call('GetGroupList').then(response => {  
        for(let g of response.groups) {
          this.sources.push({
            inputKind: 'group', inputName: g
          })
        }  
      })
    })
  }

  async toggle(visibile: boolean, scene: any, source: any) {

    let response = await this.OBS.call('GetSceneItemId', {
      sceneName : scene.sceneName,
      sourceName: source.inputName
    })

    if(response)
      await this.OBS.call('SetSceneItemEnabled', {
        sceneName: scene.sceneName,
        sceneItemId: response.sceneItemId,
        sceneItemEnabled: visibile
      })
  }

}
