import { auth } from "./firebase.js";

import {

    signInWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const botao = document.getElementById("btnEntrar");

botao.addEventListener("click", ()=>{

    const email = document.getElementById("email").value;

    const senha = document.getElementById("senha").value;

    signInWithEmailAndPassword(auth,email,senha)

    .then(()=>{

        window.location="dashboard.html";

    })

    .catch(()=>{

        document.getElementById("mensagem").innerHTML="E-mail ou senha inválidos.";

    });

});