import { Component } from '@angular/core';
import { ToastController, Platform } from 'ionic-angular'; 

import { Geolocation } from '@ionic-native/geolocation'; 

import { Storage } from '@ionic/storage';
import { UserService } from './../../shared/user.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Network } from '@ionic-native/network';
import { AngularFireDatabase } from 'angularfire2/database';  

import { Camera, CameraOptions } from '@ionic-native/camera';

 
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  sosInfo : any;
  hasNetwork : boolean = true; 
  networkType : string;
  isUserSignIn : boolean;
  isUpdateProfile : boolean;
  sosCounter : number = 0; 

  signInForm : FormGroup;
  sosForm : FormGroup;

  showSignIn : boolean;
  showSOS : boolean;
  displayInfo : boolean;
  showList : boolean;

  showSOS1 : boolean;
  showSOS2 : boolean;
  showSOS3 : boolean;

  base64image : any;

  fireUserList;
  userList = []; 

  alertMessage = {
    deviceid : null,
    fullname : null,
    latitude : null,
    longitude : null,
    situation : null,
    base64image : null,
    status : null
  }; 
 
  officer = {
        latitude : null,
        longitude : null,
        fullname : null,
        deviceid : null,
        mobilenumber : null,
        time : null
  } 

  signInUser = {
    deviceid : null,
    fullname : null,
    mobilenumber : null,
    address : null,
    emgcontactperson : null,
    emgcontactnumber : null 
  };

  sosElement = {
    situation : null,
    callback : false
  };  
   
  constructor(private geolocation: Geolocation,  
              private toaster : ToastController,
              private firebasedb : AngularFireDatabase,
              private formBuilder : FormBuilder,
              private network : Network,
              private storage : Storage,
              private camera : Camera,
              private platform : Platform,
              private userService : UserService) {
 
      this.signInForm = formBuilder.group({
         "fullname" : [null, [Validators.required]],
         "mobilenumber" : [null],
         "address" : [],
         "emgcontactperson" : [],
         "emgcontactnumber" : []
      });

      this.sosForm = formBuilder.group({
        situation : [null],
        callback : [null]
      })
 
      this.network.onConnect().subscribe(() => {
        this.toaster.create({
          message : "Network Connected!!! ",
          duration : 3000
        }).present();
        this.hasNetwork = true;
      }); 

      this.network.onDisconnect().subscribe(() => {
        this.toaster.create({
          message : "Network Disconnected!!! ",
          duration : 3000
        }).present();
        this.hasNetwork = false;
      }); 
      
      console.log("system loaded");
  
      let options = {timeout: 30000, enableHighAccuracy: true, maximumAge: 3600};      
      this.geolocation.getCurrentPosition(options).then((resp) => {
         console.log(resp.coords.latitude);
      });

      this.storage.ready().then(() => {
        console.log("Storage Ready");
         this.storage.get('profilephoto').then((val) => {
            if (val) {
              this.base64image = val;
            }
         });  
         this.storage.get('userinfo').then((val) => {
          if (val != null) {
              this.userService.setFullName(val.fullname);
              this.userService.setMobileNumber(val.mobilenumber);
              this.userService.setDeviceId(val.deviceid);          
              console.log("data read: " + val.fullname + " : " + val.mobilenumber);
                this.platform.ready().then(() => {
                  console.log("platform ready");
                   if (this.userService.getDeviceId() != null) {
                      console.log("Show SOS");
                      this.showSignIn = false;
                      this.showSOS = true;
                      this.signInUser = val;
                      console.log(this.signInUser);
                   } else {
                    console.log("Show signin");
                    this.showSignIn = true;
                    this.showSOS = false;
                  } 
              });   
            } else {
              console.log("Show signin");              
              this.showSignIn = true;
              this.showSOS = false;
            }   
          });   
       });
       this.sosCounter = 0;
  }
  
  selectPhoto() {
    let options : CameraOptions = {
        quality : 50,        
        destinationType : this.camera.DestinationType.DATA_URL,
        encodingType : this.camera.EncodingType.JPEG,
        mediaType : this.camera.MediaType.PICTURE,
        correctOrientation : true,
        sourceType : this.camera.PictureSourceType.PHOTOLIBRARY
    }

    this.camera.getPicture(options).then((imageData) => {
        this.base64image = 'data:image/jpeg;base64,' + imageData;
        this.storage.set("profilephoto", this.base64image);            
    });
  }

  getUUID() {
    return "xxxxxxx-x777x-yxxxx".replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0 , v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
  }  

  onEditProfileHandler() {
    this.isUpdateProfile = true;
    this.showSOS = false;          
  }
 
  onCallBackHandler() { 
    this.sosElement.callback = !this.sosElement.callback  
  }

  onSignInHandler() {
    this.signInUser.fullname = this.signInForm.controls["fullname"].value;
    this.signInUser.mobilenumber = this.signInForm.controls["mobilenumber"].value; 
    this.signInUser.address = this.signInForm.controls["address"].value;
    this.signInUser.emgcontactperson = this.signInForm.controls["emgcontactperson"].value; 
    this.signInUser.emgcontactnumber = this.signInForm.controls["emgcontactnumber"].value;
    if (this.signInUser.deviceid == null) {
      this.signInUser.deviceid = this.getUUID();
    }   
    this.userService.setFullName(this.signInUser.fullname);
    this.userService.setMobileNumber(this.signInUser.mobilenumber);
    this.userService.setDeviceId(this.signInUser.deviceid);
    this.storage.set("userinfo", this.signInUser);    
    this.showSignIn = false;
    this.isUpdateProfile = false;
    this.showSOS = true;
    this.sosInfo = "";
    this.sosCounter = 0;
    this.showSOS1 = false;
    this.showSOS2 = false;
    this.showSOS3 = false;          
   }
  
   findNearestOfficer(userdata: any) {
    let fullName = userdata.fullname;
    let situation = userdata.situation;
    let latitude = userdata.latitude;
    let longitude = userdata.longitude;
 
    this.userService.getOfficerDetails().then((res: any) => {
      let response = null; 
      let activeOfficerList = [];
      let userLastFound = parseInt(this.getSOSTime());
      console.log("userLastFound:" + userLastFound);
  
      if (res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            let officer = {
              name : res[i].fullname,
              lastfound : parseInt(res[i].time),
              active : (parseInt(res[i].time) >= userLastFound),
              deviceid : res[i].deviceid,
              mobilenumber : res[i].mobilenumber,
              distance : this.getDistance(latitude, longitude, res[i].latitude, res[i].longitude)
            }  
            if (officer.active) {
              activeOfficerList.push(officer);         
            }
            console.log(officer);              
          }
        }
        if (activeOfficerList.length == 1) {
          response = activeOfficerList[0];
        } else if (activeOfficerList.length > 1) {
          activeOfficerList.sort(this.getSortOrder("distance"));
          response = activeOfficerList[0];
        }
        if (response != null) {
          this.alertMessage.fullname = fullName;
          this.alertMessage.latitude = latitude;
          this.alertMessage.longitude = longitude;
          this.alertMessage.deviceid = response.deviceid;
          this.alertMessage.situation = situation;
          if (userdata["imagename"]) {
              this.alertMessage.base64image = userdata.imagename;
          } 
          this.alertMessage.status = "open";
          this.userService.sendAlert(this.alertMessage);
          this.sosInfo += "<br />Nearest Officer: " + response.name + " (" + (Math.floor(response.distance * 100) /100) + " Kms)";
        } 
      });
    } 
 
  getSortOrder(key : any) {
    return function(a, b) {
      if (a[key] > b[key]) {
        return 1;
      } else if (a[key] < b[key]) {
        return -1;
      }
      return 0;
    }
  }

  getDistance(sourceLat, sourceLon, targetLat, targetLon) {
    let R = 6371; 
    let dLat = this.deg2rad(targetLat - sourceLat); 
    let dLon = this.deg2rad(targetLon - sourceLon); 
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(sourceLat)) * Math.cos(this.deg2rad(targetLat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = R * c;
    return d;
   }

  deg2rad(deg : any) {
    return deg * (Math.PI/180)
  }  
    
  onSOSHandler(event : any) {
    if (this.sosCounter == 0) {
      this.showSOS1 = false;
      this.showSOS2 = false;
      this.showSOS3 = false;
    }
    this.sosInfo = "";
    console.log("sosCounter: " + this.sosCounter);
    if (this.hasNetwork) {
        this.sosCounter++;
        if (this.sosCounter == 1) {
          this.showSOS1 = true;
        }
        if (this.sosCounter == 2) {
          this.showSOS2 = true;
        }
        if (this.sosCounter == 3) {
          this.showSOS3 = true;
        }          

        if (this.sosCounter > 2) {
          this.sosCounter = 0;
          console.log("Sent request...");
          event.target.src = "assets/imgs/sos-button-pressed.jpg"; 
          this.sosInfo = "Locating.....";
          this.sosElement.situation = (this.sosForm.controls["situation"].value != null ? this.sosForm.controls["situation"].value : "Unknown");
          let options = {timeout: 30000, enableHighAccuracy: true, maximumAge: 3600};
          this.geolocation.getCurrentPosition(options).then((resp) => {
                
              this.sosInfo = "<strong>Your Current Location:</strong><br /><br />";

              let latitude = resp.coords.latitude;
              let longitude = resp.coords.longitude;
              let altitude = resp.coords.altitude;

              this.sosInfo += "Latitude: " + latitude + ", DMS: " + "N " + this.convertDMS(latitude) + "<br />";
              this.sosInfo += "Longitude: " + longitude + ", DMS: " + "E " + this.convertDMS(longitude) + "<br />";
 
              let dt = new Date();                  
              let userData = { 
                "fullname": this.signInUser.fullname, 
                "mobilenumber" : this.signInUser.mobilenumber,
                "deviceid" : this.signInUser.deviceid, 
                "address" : this.signInUser.address,
                "emgcontactperson" : this.signInUser.emgcontactperson,
                "emgcontactnumber" : this.signInUser.emgcontactnumber,
                "callback" : this.sosElement.callback,
                "situation" : this.sosElement.situation,
                "latitude" : latitude,
                "longitude" : longitude,
                "altitude" : altitude,
                "location" : "Chennai",
                "status" : "open",
                "timestamp" : dt.getDate() + "-" + dt.getMonth() + "-" + dt.getFullYear() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds()  
                };

             console.log(userData);  
             this.userService.saveUser(userData, this.base64image);
              this.toaster.create({
                message : "Request successfully submitted!!! ",
                duration : 3000
              }).present();
              event.target.src = "assets/imgs/sos-button-normal.jpg";          
              this.findNearestOfficer(userData);  
            }).catch((error) => {
              console.log('Error getting location', error);
              this.sosInfo = "Error: " + error.message;
              this.toaster.create({
                message : "Request failed!!! ",
                duration : 3000
              }).present();
              event.target.src = "assets/imgs/sos-button-normal.jpg";         
            }); 

          this.displayInfo = true;
          }
      } else {
        this.toaster.create({
          message : "No Network!!! ",
          duration : 3000
        }).present();    
      } 

  } 

  convertDMS(decimal_degrees : number) {
    let minutes = (decimal_degrees - Math.floor(decimal_degrees)) * 60.0; 
    let seconds = (minutes - Math.floor(minutes)) * 60.0; 
 
    minutes = Math.floor(minutes);
    seconds = Math.floor(seconds); 
    
    return Math.round(decimal_degrees) + "° " + minutes + "' " + seconds + "\""; 
  }

  getSOSTime() {
    let dt = new Date();
    dt.setSeconds(dt.getSeconds() - 30);
    return this.getDecimal(dt.getFullYear()) + "" + this.getDecimal(dt.getMonth()) + this.getDecimal(dt.getDate()) + this.getDecimal(dt.getHours()) + this.getDecimal(dt.getMinutes()) + this.getDecimal(dt.getSeconds())    
  }
 
  getCurrentTime() {
    let dt = new Date();
    return this.getDecimal(dt.getFullYear()) + "" + this.getDecimal(dt.getMonth()) + this.getDecimal(dt.getDate()) + this.getDecimal(dt.getHours()) + this.getDecimal(dt.getMinutes()) + this.getDecimal(dt.getSeconds())    
  } 

  getDecimal(dt : any) {
    let response = new String(dt)
    if (response.length == 1) {
       response = "0" + response;
    } 
    return response;
 } 

}
