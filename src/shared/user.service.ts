import { Injectable } from '@angular/core';
import firebase from "firebase";

@Injectable()
export class UserService { 

  fullname : string;
  mobilenumber : string;
  diviceid : string;

  constructor() {
    console.log('User Service');
  }

  uploadPhoto(fileref : string, base64image : any) {
    let storageRef = firebase.storage().ref();
    let imageRef = storageRef.child(fileref);
    imageRef.putString(base64image, firebase.storage.StringFormat.DATA_URL).then((snapshot) => { 
         console.log("Image uploaded");
    });
  } 
 
  saveUser(userData : any, base64image : any) {
    let firedata = firebase.database().ref('/sosusers');

    if (base64image) {
      let imageName = "images/" + userData.deviceid + ".jpg";
      this.uploadPhoto(imageName, base64image);
      userData["imagename"] = imageName;    
    }  
    firedata.push(userData);
  }

  sendAlert(alertMessage : any) {
    let firedata = firebase.database().ref('/sosalerts')
    firedata.push(alertMessage);     
  }
 
  getOfficerDetails() {
    var promise = new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/officers');
      ref.once('value', (snapshot) => {
          let officerList = snapshot.val();
          let temparr = [];
          for (var key in officerList) { 
              let user = officerList[key]; 
              user["key"] = key;
              temparr.push(user); 
          }
          resolve(temparr);
      }).catch((err) => {
          reject(err);
      })
  })
  return promise;
}
      
  setFullName(fullname : string) {
    this.fullname = fullname;
  }

  setMobileNumber(mobilenumber : string) {
    this.mobilenumber = mobilenumber;
  }  

  getFullName() {
    return this.fullname;
  }

  getMobileNumber() {
    return this.mobilenumber;
  } 

  getDeviceId() {
    return this.diviceid;
  }
  
  setDeviceId(deviceId : string) {
    this.diviceid = deviceId;
  }

}