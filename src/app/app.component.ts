import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';

import * as mqtt from 'mqtt';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject} from 'rxjs/BehaviorSubject';

let mqttOptions : mqtt.IClientOptions = {
    host: "ws://test.mosquitto.org",
    port: 8080,
    keepalive: 60000,
    reconnectPeriod: 10000,
    clientId: 'ionic_phone_app_' + Math.floor(Math.random()*9999),
    username: "",
    password: "",
};

export interface Door { 
  readonly name: string
  readonly isOpen : Observable<boolean>
  readonly isOnline : Observable<boolean>
  readonly activate: () => void;
  readonly toggle : () => void;
}
// Writeable counterpart to Door
interface InsideDoor {
  readonly name: string
  isOpen : Subject<boolean>
  isOnline : Subject<boolean>
  readonly activate: () => void;
  readonly toggle : () => void;
}
function mkDoor(id:string, client : mqtt.Client, online : boolean) : InsideDoor {
    return { 
      name: id, 
      isOpen: new BehaviorSubject(false),
      isOnline: new BehaviorSubject(online), 
      toggle: () => client.publish(`/garage/${id}/command`,"TOGGLE"), 
      activate: () => client.subscribe(`/garage/${id}/+`)
    };
}

function isOnline(status : Buffer) { return status.toString() == 'online'; }
function isOpen(status : Buffer) { return status.toString() == 'OPEN'; }

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  private client : mqtt.Client;

  rootPage: any = HomePage;
  doors: Observable<Door[]>

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();
    this.initializeMqtt();
  }

  initializeMqtt() {
    this.client = mqtt.connect(mqttOptions.host, mqttOptions);
    this.client.on('connect', () => console.log('connected'));
    this.client.on('reconnect', () => console.log('reconnect'));
    this.client.on('offline', () => console.log('offline :('));
    this.client.on('error', x => console.log('error: ' + x));
    this.client.on('subscribe', _ => console.log('subscribe'));
    this.client.subscribe("/garage/+/status");


    // load saved door
    let saved_door = window.localStorage.getItem("selected_door");

    this.doors = Observable.create(observer => {
      let clients = new Map<string,InsideDoor>();
      let topicrx = /\/garage\/(.*)\/(status|isopen)/;
      this.client.on('message', (topic,message,packet) => {
        let match = topicrx.exec(topic);
        if (match) {
          let [_, name, chan] = match;
          let door = clients.get(name);
          if (chan == "status") {
            if (door) {
              // existing door status changed
              door.isOnline.next(isOnline(message));
            }
            else {
              // new door discovered
              console.log("new door " + name);
              // todo: If name is 'saved_name' navigate to it now
              clients.set(name, mkDoor(name, this.client, isOnline(message)));
              // Interesting that I need a cast here.  It means Angular is erasign the type in the list...
              if (name == saved_door) this.selectDoor(clients.get(name) as Door);
              let values = Array.from(clients.values());
              observer.next(values);
            }
          }
          else if (chan == 'isopen') {
            if (door) {
              let val = isOpen(message);
              console.log(`set ${name} isopen: ${val}`);
              door.isOpen.next(val);
            }
          }
        }
      });
    });
    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  selectDoor(door : Door) {
    door.activate();
    // If we want to enable back: (but it grows the dom)
    // this.nav.push(HomePage, { door: door });
    this.nav.setRoot(HomePage, { door: door });
  }
}
