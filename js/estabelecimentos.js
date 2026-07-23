import { db } from "./firebase.js";
import { comprimirImagem } from "./imagem.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

//========================
// Campos
//========================

const txtNome = document.getElementById("nomeEstabelecimento");
const cmbCategoria = document.getElementById("categoria");
const txtDescricao = document.getElementById("descricao");

const txtTelefone = document.getElementById("telefone");
const txtWhatsapp = document.getElementById("whatsapp");

const txtEndereco = document.getElementById("endereco");
const txtBairro = document.getElementById("bairro");
const txtCidade = document.getElementById("cidade");
const txtMapa = document.getElementById("mapa");

const txtSite = document.getElementById("site");
const txtInstagram = document.getElementById("instagram");
const txtFacebook = document.getElementById("facebook");

const txtHorario = document.getElementById("horario");
const txtFoto = document.getElementById("foto");
const previewFoto = document.getElementById("previewFoto");
const chkAtivo = document.getElementById("ativo");
const chkDestaque = document.getElementById("destaque");

const btnSalvar = document.getElementById("btnSalvar");

const lista = document.getElementById("listaEstabelecimentos");

let editando = null;
let fotoBase64 = "";

//========================
// Categorias
//========================

const consultaCategorias = query(
    collection(db, "categorias"),
    orderBy("nome")
);

onSnapshot(consultaCategorias, (snapshot) => {

    cmbCategoria.innerHTML =
        '<option value="">Selecione...</option>';

    snapshot.forEach((item) => {

        const categoria = item.data();

        cmbCategoria.innerHTML += `
            <option value="${item.id}">
                ${categoria.nome}
            </option>
        `;

    });

});

//========================
// Preview da Foto
//========================

txtFoto.addEventListener("change", async () => {

    if (!txtFoto.files.length) return;

    try {

        fotoBase64 = await comprimirImagem(txtFoto.files[0]);

        previewFoto.src = fotoBase64;
        previewFoto.style.display = "block";

    } catch (erro) {

        alert("Erro ao processar a imagem.");

        console.error(erro);

    }

});
//======================== // Salvar //========================

btnSalvar.addEventListener("click", salvar);

async function salvar() {

    const nome = txtNome.value.trim();

    if (nome === "") {

        alert("Digite o nome.");

        fotoBase64 = "";
    txtFoto.value = "";
    previewFoto.src = "";
    previewFoto.style.display = "none";

    txtNome.focus();

        return;

    }

    if (cmbCategoria.value === "") {

        alert("Selecione uma categoria.");

        return;

    }

    const consulta = query(
        collection(db, "estabelecimentos"),
        where("nomeLower", "==", nome.toLowerCase())
    );

    const resultado = await getDocs(consulta);

    let duplicado = false;

    resultado.forEach((item) => {

        if (item.id !== editando) {

            duplicado = true;

        }

    });

    if (duplicado) {

        alert("Este estabelecimento já existe.");

        return;

    }
    const dados = {

        nome: nome,
        nomeLower: nome.toLowerCase(),
        foto: fotoBase64,
        categoriaId: cmbCategoria.value,
        categoriaNome:
            cmbCategoria.options[cmbCategoria.selectedIndex].text,

        descricao: txtDescricao.value,

        telefone: txtTelefone.value,
        whatsapp: txtWhatsapp.value,

        endereco: txtEndereco.value,
        bairro: txtBairro.value,
        cidade: txtCidade.value,

        mapa: txtMapa.value,

        site: txtSite.value,
        instagram: txtInstagram.value,
        facebook: txtFacebook.value,

        horario: txtHorario.value,

        ativo: chkAtivo.checked,
        destaque: chkDestaque.checked

    };

    if (editando == null) {

        dados.createdAt = serverTimestamp();

        await addDoc(
            collection(db, "estabelecimentos"),
            dados
        );

    } else {

        await updateDoc(
            doc(db, "estabelecimentos", editando),
            dados
        );

    }

    limpar();

}

//======================== // Listagem //========================

    const consultaEstabelecimentos = query(
        collection(db, "estabelecimentos"),
        orderBy("nome")
    );

    onSnapshot(consultaEstabelecimentos, (snapshot) => {

        lista.innerHTML = "";

        if (snapshot.empty) {

        lista.innerHTML =
            "<p>Nenhum estabelecimento cadastrado.</p>";

        return;

    }

    snapshot.forEach((item) => {

        const est = item.data();

        const div = document.createElement("div");

        div.className = "categoria-item";

        div.innerHTML = `

            <strong>${est.nome}</strong>

            <br>

            ${est.categoriaNome}

            <br>

            ${est.cidade ?? ""}

            <br><br>

            <button class="editar">

                Editar

            </button>

            <button class="excluir">

                Excluir

            </button>

        `;

        div.querySelector(".editar").onclick = () => editar(item.id, est);

        div.querySelector(".excluir").onclick = () => excluir(item.id, est.nome);

        lista.appendChild(div);

    });

});

//======================== // Editar //========================

function editar(id, est) {

    editando = id;

    txtNome.value = est.nome;

    cmbCategoria.value = est.categoriaId;

    txtDescricao.value = est.descricao || "";

    txtTelefone.value = est.telefone || "";

    txtWhatsapp.value = est.whatsapp || "";

    txtEndereco.value = est.endereco || "";

    txtBairro.value = est.bairro || "";

    txtCidade.value = est.cidade || "";

    txtMapa.value = est.mapa || "";

    txtSite.value = est.site || "";

    txtInstagram.value = est.instagram || "";

    txtFacebook.value = est.facebook || "";

    txtHorario.value = est.horario || "";

    fotoBase64 = est.foto || "";
    if (fotoBase64) {
        previewFoto.src = fotoBase64;
        previewFoto.style.display = "block";
    } else {
        previewFoto.style.display = "none";
    }

    chkAtivo.checked = est.ativo;

    chkDestaque.checked = est.destaque;

    btnSalvar.textContent =
        "Atualizar Estabelecimento";

}

//======================== // Excluir //========================

async function excluir(id, nome) {

    if (!confirm(`Excluir "${nome}" ?`)) return;

    await deleteDoc(doc(db, "estabelecimentos", id));

}

//======================== // Limpar //========================

function limpar() {

    editando = null;

    txtNome.value = "";

    txtDescricao.value = "";

    txtTelefone.value = "";

    txtWhatsapp.value = "";

    txtEndereco.value = "";

    txtBairro.value = "";

    txtCidade.value = "";

    txtMapa.value = "";

    txtSite.value = "";

    txtInstagram.value = "";

    txtFacebook.value = "";

    txtHorario.value = "";

    cmbCategoria.value = "";

    chkAtivo.checked = true;

    chkDestaque.checked = false;

    btnSalvar.textContent =
        "Salvar Estabelecimento";

    txtNome.focus();

}
