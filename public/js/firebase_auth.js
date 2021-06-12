// var currentUser = firebase.auth().currentUser;
// if(currentUser != null){
//     console.log("Loggeado");
// }else{
//     console.log("no loggeado");
//     myUrl = `${location.origin}/index.html`;
//     if(location.href != location.origin && location.href != myUrl){
//       location.href = myUrl;
//     }
// }

function signOutFirebase(){
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    myUrl = `${location.origin}/index.html`;
    location.href = myUrl;
    console.log("Sign-out");
  }).catch((error) => {
    // An error happened.
    console.log("Error signing out");
  });
}