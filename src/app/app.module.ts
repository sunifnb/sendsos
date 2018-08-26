import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';  
import { UserService } from '../shared/user.service';
import { Network } from '@ionic-native/network';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
 
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { IonicStorageModule } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';

var config = {
  apiKey: "AIzaSyAQS1S2W0IaQzG2PNAqcBWdz4lxdtEUbn0",
  authDomain: "ng-users-59dfc.firebaseapp.com",
  databaseURL: "https://ng-users-59dfc.firebaseio.com",
  projectId: "ng-users-59dfc",
  storageBucket: "ng-users-59dfc.appspot.com",
  messagingSenderId: "987852749716"
};
 
@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(config),
    IonicStorageModule.forRoot({
      name: '__mydb',
         driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen, 
    Geolocation,
    Network,
    UserService, 
    Camera, 
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
