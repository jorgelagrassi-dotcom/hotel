// js/imagem.js

const LARGURA_MAXIMA = 600;
const ALTURA_MAXIMA = 400;
const QUALIDADE = 0.75;

/**
 * Comprime, redimensiona e retorna a imagem em Base64.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function comprimirImagem(file) {
    return new Promise((resolve, reject) => {

        if (!file) {
            reject("Nenhuma imagem selecionada.");
            return;
        }

        const leitor = new FileReader();

        leitor.onload = (e) => {

            const img = new Image();

            img.onload = () => {

                let largura = img.width;
                let altura = img.height;

                const proporcao = Math.min(
                    LARGURA_MAXIMA / largura,
                    ALTURA_MAXIMA / altura,
                    1
                );

                largura *= proporcao;
                altura *= proporcao;

                const canvas = document.createElement("canvas");
                canvas.width = largura;
                canvas.height = altura;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, largura, altura);

                const base64 = canvas.toDataURL("image/jpeg", QUALIDADE);

                resolve(base64);
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        leitor.onerror = reject;
        leitor.readAsDataURL(file);

    });
}