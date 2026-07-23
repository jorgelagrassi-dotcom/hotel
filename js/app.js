import { auth } from "./firebase.js";

import {

    signOut

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const sair = document.getElementById("btnSair");

if(sair){

    sair.addEventListener("click",()=>{

        signOut(auth).then(()=>{

            window.location="login.html";

        });

    });

}