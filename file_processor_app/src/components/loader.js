import {toast} from "react-toastify";

export class FileList {
    constructor(apiUrl = 'http://file_processor:8081/') {
        this.apiUrl = apiUrl;
    }

    async list(page, rate) {
        try {
            const form = new FormData();
            const response = await fetch((this.apiUrl + "?page=" + page + "&rate=" + rate), {
                method: 'GET',
            });

            if (!response.ok) {
                toast.error("O serviço de consulta de imagens retornou um erro!");
                return "";
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            toast.error("O serviço de consulta de imagens retornou um erro!");
            return false;
        }
    }

    async delete(fileKey) {
        try {
            const response = await fetch(`${this.apiUrl}/${fileKey}`, {
                method: 'DELETE',
            });

            return response.ok;
        } catch (error) {
            console.log(`Error deleting file: ${error}`);
            return false;
        }
    }
}
