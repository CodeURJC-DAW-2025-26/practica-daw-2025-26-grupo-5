import api from "~/services/api";

export async function improveDescription(productName: string, basicInfo: string): Promise<string> {
    const response = await api.post('/v1/ai/generate-description', {
        productName,
        basicInfo
    });
    return response.data;
}