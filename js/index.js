import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

//==================================
// ELEMENTOS DA TELA
//==================================

const txtPesquisa = document.getElementById("txtPesquisa");
const lista = document.getElementById("listaEstabelecimentos");
const menuCategorias = document.getElementById("menuCategorias");
const modal = document.getElementById("modalEmpresa");
const conteudoModal = document.getElementById("conteudoModal");
const fecharModal = document.getElementById("fecharModal");
//==================================
// DADOS
//==================================

let estabelecimentos = [];
let categoriaSelecionada = "todas";

//==================================
// WHATSAPP
//==================================

function numeroWhatsApp(numero) {

    const digits = String(numero || "").replace(/\D/g, "");

    // Se o cadastro já tiver o código do Brasil, mantém.
    if (digits.startsWith("55") && digits.length >= 12) {
        return digits;
    }

    // Para números brasileiros cadastrados sem +55.
    if (digits.length === 10 || digits.length === 11) {
        return "55" + digits;
    }

    return digits;

}

function linkWhatsApp(numero) {

    const numeroFormatado = numeroWhatsApp(numero);

    const mensagem = "Olá! Vi você pelo aplicativo Guia Comercial. Quero saber mais informações.";

    return `https://wa.me/${numeroFormatado}?text=${encodeURIComponent(mensagem)}`;

}

//==================================
// CARREGAR CATEGORIAS
//==================================

const consultaCategorias = query(
    collection(db, "categorias"),
    orderBy("nome")
);

onSnapshot(consultaCategorias, (snapshot) => {

    menuCategorias.innerHTML = "";

    criarBotaoCategoria("Todas", "todas");

    snapshot.forEach((doc) => {

        criarBotaoCategoria(
            doc.data().nome,
            doc.id
        );

    });

});

//==================================
// BOTÕES DAS CATEGORIAS
//==================================

function criarBotaoCategoria(nome, id) {

    const btn = document.createElement("button");

    btn.className = "categoria-btn";

    if (id === categoriaSelecionada) {
        btn.classList.add("ativo");
    }

    btn.textContent = nome;

    btn.onclick = () => {

        categoriaSelecionada = id;

        document
            .querySelectorAll(".categoria-btn")
            .forEach(botao => botao.classList.remove("ativo"));

        btn.classList.add("ativo");

        mostrarEstabelecimentos();

    };

    menuCategorias.appendChild(btn);

}

//==================================
// BUSCAR ESTABELECIMENTOS
//==================================

const consulta = collection(db, "estabelecimentos");

onSnapshot(

    consulta,

    (snapshot) => {

        estabelecimentos = [];

        snapshot.forEach((doc) => {

            const dados = doc.data();

            if (dados.ativo === true) {

                estabelecimentos.push({

                    id: doc.id,
                    ...dados

                });

            }

        });

        estabelecimentos.sort((a, b) =>
            (a.nome || "").localeCompare(b.nome || "")
        );

        mostrarEstabelecimentos();

    },

    (erro) => {

        console.error(erro);

        lista.innerHTML =
            "<p>Erro ao carregar os estabelecimentos.</p>";

    }

);

//==================================
// PESQUISA
//==================================

txtPesquisa.addEventListener("keyup", mostrarEstabelecimentos);
fecharModal.onclick = () => {

    modal.classList.remove("ativo");

};

modal.onclick = (e) => {

    if(e.target === modal){

        modal.classList.remove("ativo");

    }

};
//==================================
// MOSTRAR
//==================================

function mostrarEstabelecimentos() {

    const pesquisa = txtPesquisa.value.toLowerCase();

    lista.innerHTML = "";

    const resultado = estabelecimentos.filter((est) => {

        const nome = (est.nome || "").toLowerCase();

        const descricao = (est.descricao || "").toLowerCase();

        const pesquisaOk =
            nome.includes(pesquisa) ||
            descricao.includes(pesquisa);

        const categoriaOk =
            categoriaSelecionada === "todas" ||
            est.categoriaId === categoriaSelecionada;

        return pesquisaOk && categoriaOk;

    });

    if (resultado.length === 0) {

        lista.innerHTML =
            "<p>Nenhum estabelecimento encontrado.</p>";

        return;

    }

    resultado.forEach((est) => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `

            <div class="card-imagem">

                ${
                    est.foto
                        ? `<img class="foto-estabelecimento" src="${est.foto}" alt="${est.nome}">`
                        : `<div class="sem-foto">SEM FOTO</div>`
                }

            </div>

            <div class="card-conteudo">

                <h2>${est.nome || ""}</h2>

                <div class="badges">

                    <span class="badge categoria">

                        ${est.categoriaNome || "Categoria"}

                    </span>

                    <span class="badge cidade">

                        ${est.cidade || "Cidade"}

                    </span>

                </div>

                <p class="descricao">

                    ${est.descricao || ""}

                </p>

                <div class="acoes">

                    ${
                        est.whatsapp
                            ? `
                            <a
                                class="btn btn-laranja"
                                href="${linkWhatsApp(est.whatsapp)}"
                                target="_blank"
                                rel="noopener noreferrer">

                                Entrar em contato

                            </a>
                            `
                            : ""
                    }

                    <button
                        class="btn btn-verde btnDetalhes"
                        data-id="${est.id}">

                        Ver detalhes

                    </button>

                </div>

            </div>

        `;

        lista.appendChild(card);

        const btnDetalhes = card.querySelector(".btnDetalhes");

        btnDetalhes.addEventListener("click", () => {

            conteudoModal.innerHTML = `
        
                ${
                    est.foto
                    ? `<img src="${est.foto}" alt="${est.nome}">`
                    : `<div class="sem-foto">SEM FOTO</div>`
                }
        
                <div class="modal-info">
        
                    <h2>${est.nome}</h2>
        
                    <p><strong>Categoria:</strong> ${est.categoriaNome || "-"}</p>
        
                    <p><strong>Cidade:</strong> ${est.cidade || "-"}</p>
        
                    <p>${est.descricao || ""}</p>
        
                    ${
                        est.telefone
                        ? `<p><strong>Telefone:</strong> ${est.telefone}</p>`
                        : ""
                    }
        
                    ${
                        est.whatsapp
                        ? `
                            <p>
                                <strong>WhatsApp:</strong> ${est.whatsapp}
                            </p>

                            <p>
                                <a
                                    class="btn btn-laranja"
                                    href="${linkWhatsApp(est.whatsapp)}"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    Abrir WhatsApp
                                </a>
                            </p>
                        `
                        : ""
                    }
        
                    ${
                        est.site
                        ? `<p><a href="${est.site}" target="_blank">Abrir site</a></p>`
                        : ""
                    }
        
                    ${
                        est.instagram
                        ? `<p><a href="${est.instagram}" target="_blank">Instagram</a></p>`
                        : ""
                    }
        
                    ${
                        est.facebook
                        ? `<p><a href="${est.facebook}" target="_blank">Facebook</a></p>`
                        : ""
                    }
        
                    ${
                        est.mapa
                        ? `<p><a href="${est.mapa}" target="_blank">Como chegar</a></p>`
                        : ""
                    }
        
                </div>
        
            `;
        
            modal.classList.add("ativo");
        
        });

    });

}