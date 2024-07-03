import {toast} from "react-toastify";

export class FileSenderAdapter {
    constructor(apiUrl = 'http://file_processor:8081') {
        this.apiUrl = apiUrl;
    }

    async put(fileKey, fileData, op) {
        try {
            const form = new FormData();
            form.append('name', fileKey);
            form.append('type', 'png');
            form.append('operation', op);
            form.append('file', new Blob([fileData]), fileKey);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: form,
            });

            if (!response.ok) {
                toast.error("O serviço de upload de imagens retornou um erro!");
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            toast.success("Arquivo enviado para processamento!");

            return data.url;
        } catch (error) {
            console.log(`Error putting file: ${error}`);
            return false;
        }
    }

    async delete(fileKey) {
        try {
            const response = await fetch(`${this.apiUrl}/?key=${fileKey}`, {
                method: 'DELETE',
            });

            toast.success("Imagem removida com sucesso!");
            return response.ok;
        } catch (error) {
            toast.error("O serviço de imagens retornou um erro!");
            return false;
        }
    }
}
