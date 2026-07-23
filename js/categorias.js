import { db } from "./firebase.js";

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

const txtNome = document.getElementById("nomeCategoria");
const btnSalvar = document.getElementById("btnSalvar");
const lista = document.getElementById("listaCategorias");

let categoriaEditando = null;

// ================================
// Salvar Categoria
// ================================

btnSalvar.addEventListener("click", salvarCategoria);

async function salvarCategoria() {

    const nome = txtNome.value.trim();

    if (nome === "") {

        alert("Digite o nome da categoria.");
        txtNome.focus();
        return;

    }

    try {

        const consulta = query(
            collection(db, "categorias"),
            where("nomeLower", "==", nome.toLowerCase())
        );

        const resultado = await getDocs(consulta);

        let duplicado = false;

        resultado.forEach((item) => {

            if (item.id !== categoriaEditando) {

                duplicado = true;

            }

        });

        if (duplicado) {

            alert("Já existe uma categoria com esse nome.");
            return;

        }

        if (categoriaEditando === null) {

            await addDoc(collection(db, "categorias"), {

                nome: nome,
                nomeLower: nome.toLowerCase(),
                createdAt: serverTimestamp()

            });

        } else {

            await updateDoc(doc(db, "categorias", categoriaEditando), {

                nome: nome,
                nomeLower: nome.toLowerCase()

            });

        }

        limparFormulario();

    } catch (erro) {

        console.error(erro);
        alert("Erro ao salvar categoria.");

    }

}

// ================================
// Listagem em Tempo Real
// ================================

const consultaCategorias = query(
    collection(db, "categorias"),
    orderBy("nome")
);

onSnapshot(consultaCategorias, (snapshot) => {

    lista.innerHTML = "";

    if (snapshot.empty) {

        lista.innerHTML = "<p>Nenhuma categoria cadastrada.</p>";
        return;

    }

    snapshot.forEach((item) => {

        const categoria = item.data();

        const div = document.createElement("div");

        div.className = "categoria-item";

        div.innerHTML = `
            <strong>${categoria.nome}</strong>

            <div>

                <button class="editar">Editar</button>

                <button class="excluir">Excluir</button>

            </div>
        `;

        div.querySelector(".editar").addEventListener("click", () => {

            categoriaEditando = item.id;

            txtNome.value = categoria.nome;

            btnSalvar.textContent = "Atualizar Categoria";

            txtNome.focus();

        });

        div.querySelector(".excluir").addEventListener("click", async () => {

            if (!confirm(`Excluir "${categoria.nome}"?`)) return;

            try {

                await deleteDoc(doc(db, "categorias", item.id));

            } catch (erro) {

                console.error(erro);
                alert("Erro ao excluir categoria.");

            }

        });

        lista.appendChild(div);

    });

});

// ================================
// Limpar Formulário
// ================================

function limparFormulario() {

    categoriaEditando = null;

    txtNome.value = "";

    btnSalvar.textContent = "Salvar Categoria";

    txtNome.focus();

}