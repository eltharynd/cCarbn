import { ChatClient } from '@twurple/chat'
import { from } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { Settings } from '../db/models/settings'

import { Common } from '../messages/categories/common'
import { Everyone } from '../messages/categories/everyone'
import { Moderators } from '../messages/categories/moderators'
import { Pokemon } from '../messages/categories/pokemon'
import { Storeable } from '../messages/categories/storeable'
 
export class Chat {

  static clients: IChatClient[] = []
  static defaultUserProvider

  private static async find(userId) {
    return await from(Chat.clients).pipe(filter(c => c.userId.toString() === userId.toString())).toPromise()
  }

  static async connect(user, settings?) {
    if(await Chat.find(user._id))
      throw new Error(`User doesn't have a connected client...`)

    let client = await this.connectToUser(user)
    let iClient = {
      userId: user._id.toString(),
      client: client,
      //@ts-ignore
      settings: settings? settings : (await Settings.findOne({userId: user._id}).json)
    }
    Chat.clients.push(iClient)


/*        let list = `14bigchill8
    1hangg4ze
    abubakralsneediq
    afclipper
    Aiden429_
    Alecazam223
    Alexgolf1
    Ali____007
    aprincipledgroyper
    Avatar_of_nickfuentes 
    Axiboii
    Baleezia
    basedinheaven
    Basedjohnlemon
    basedleaf_
    Bigbibbagooba
    bigkek6000
    Bigstankybibba
    Blueeyesgloyp
    Borracho_mole
    Bruhgamer92312234
    bugermodeaf
    Burn_sodomites
    case_troop 
    chargeroutlet
    chickennuggetsgroyper
    chrisisking12310
    Christrules33
    Clottinger
    Clzoomer
    Commanderroberts
    copensneed
    Cozy_tv_slash_ux
    cozyrussianbot
    Cozysneeder88
    Credo420
    creedo_af
    Crocodile500
    Darwin
    Darwnn_
    dep2222
    Dergroyper1
    Destroysodomites 
    Donbvonb
    DrPurpkush69
    Dustythyme
    Dutchr4per
    Eastsidegroyper
    epicgamermoe
    F_a_t_b_o_i
    Faqqotburner 
    finalsolutioner
    Fitrick:
    Fk_ukraine
    Freakedit998
    friendlyfriend1281025
    Fur_real_doe
    Georgebush6000
    girlpuncher
    gloyper999
    Gofindgod123
    Goldenbergdaniel 
    gr0yper75864576495749
    Grortssproyper
    groyp_er
    groyper675907889
    GroyperLivesMatter:
    Groyperwomble977997
    hail_ux
    Heilputin777
    Homie_1000
    Iagest
    iagest: 
    ILOvebLKs
    Iluvputin12
    ivtjarie11
    Jamstion
    jay1p10
    Jeffreyepstein01953
    Joshua_cs
    Jroxberg
    Jughead_certified
    Just_another_groyper
    Juuuuuiice
    kamikaze_kek
    kickassfast
    kivvyfren
    Krankiis
    Krankkis
    Krongel 
    Kylerittenhousesimp4
    Lieutenantroosevelt 
    liirespector
    Lookingforgoodcontent
    LORD_PUTIN_WILL_PREVAIL
    Lurchmusic
    luvforputin
    Mapleleafgroyper1
    Markrobinsonfan
    michigandergroyper
    Minionofux 
    Missourifren
    Monestesian
    moooooooppp
    Muhsixtygorillions
    Munzygroyper123
    newportglory
    Nick_fuentes_respector
    Nickthegreekplaysgames
    Nloverskippy 
    nottexgroyp
    Npclsd
    Officialromankennedy
    OGBigFloyd4659 
    Ohio_hillbilly
    OnceNFutureGroyper
    Onionpill
    Osikyr 
    outacredit
    Pajarito9700
    Papafabio5757
    pepethefrong_14
    pizzapaner 
    Plural0 
    poo_groyper_man
    Poopmaster291819
    Pravisgroyper
    Putin_ends_globalhomo
    Putinkillzgaze
    Putinrespecter__
    Putins_strongest_warrior
    Putinstopguy 
    Rafa__28
    Rapper6000
    rashatsinghgroyper7
    reformingincel
    Renistakn
    Resto_bro
    Rockinwithnickfuentes
    Rom6n
    rrrt09
    russiabot_00255
    Russiabot00556
    Russiakillsukrainehomos
    russian_bot45623264375
    russian_patriot111
    Russian_patriot1231
    S3xualCoercionDoer
    Schizomicrowave
    Smileforputin
    Smileforputin
    Sneedamirputin 
    Sneedbringer 
    Sneederofkiev 
    Sneedfeed420
    sneedfeederdaddy
    Sneedingpatriot 
    Sodomitesburnnn
    soup13295801324
    southloopgloyper
    Squiddle058
    Stinkyscrambler
    T1nyweener
    TaviTeo
    Tedbundygroyper
    Tenryo
    thelittl3littl3
    thevoidzzzz 
    Theyseemetrollingaf
    thicccswole
    tinxho 
    Tommybenzo
    toogoodforaname42
    Total_putin_victory
    Tqest
    Trad_albert
    Tradcath_louis
    Tragicregret22
    Tsarputin34
    ukraine_is_russia
    Unclothsnake 
    uxisbased
    Vitamingroyper 
    Vladimir_groyper776765
    Westcoastgroyper
    Western_groyper
    Whitepilledpennamite
    Wolfbite89
    womandestroyerr 
    Woodlandsgroyper
    xixingpenginc
    yourgross1ew
    Znader`
    //console.log(user)
    if(user._id.toString() === '61118f4ce72d0103d112f005') {

      let toBan = list.split('\n')
      let i=1
      console.log(toBan)
      for(let u of toBan) {
        setTimeout(() => {
          iClient.client.say('def1ance_', `/ban ${u.replace(/\s/gi, '')}`)
        }, 1000 * i++);
        
      }
    }    */
    
    await this.bindCategories(iClient, settings)
  }

  static async disconnect(user, settings?) {
    let iClient = await this.find(user._id)
    if(iClient) {
      await iClient.client.quit() 
      Chat.clients.splice(Chat.clients.indexOf(iClient), 1)
    }

  }


  static async connectToUser(user) {
    let chatClient = new ChatClient({
      authProvider: Chat.defaultUserProvider,
      channels: [user.twitchName],
      requestMembershipEvents: true,
      logger: {
        minLevel: 'info'
      }
    })
    chatClient.connect()
    return chatClient
  }

  static async bindCategories(iClient, settings) {
    if(settings?.chatbot?.categories?.common?.enabled) new Common(iClient)
    if(settings?.chatbot?.categories?.everyone?.enabled) new Everyone(iClient)
    if(settings?.chatbot?.categories?.moderators?.enabled) new Moderators(iClient)
    if(settings?.chatbot?.categories?.pokemon?.enabled) new Pokemon(iClient)
    if(settings?.chatbot?.categories?.storeable?.enabled) new Storeable(iClient)
  }

  static async toggleCategory(user, category: Category, enable, settings) {
    let iClient = await this.find(user._id)
    if(!iClient && enable) {
      throw new Error(`User doesn't have a connected client...`)

    } else  {
      if(enable) {
        //TODO check if already connected
        switch(category) {
          case Category.common:
            new Common(iClient)
            break
          case Category.everyone:
            new Everyone(iClient)
            break
          case Category.moderators:
            new Moderators(iClient)
            break
          case Category.pokemon:
            new Pokemon(iClient)
            break
          case Category.storeable:
            new Storeable(iClient)
            break
        } 
      } else {
        await iClient.client.quit()
        iClient.client = await this.connectToUser(user)
        await this.bindCategories(iClient, settings)
      }
    }
  }

}



export class IChatClient {
  userId: string
  client: ChatClient
}

export enum Category {
  common,
  everyone,
  moderators,
  pokemon,
  storeable
}