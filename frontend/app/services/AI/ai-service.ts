import api from "~/services/api";

export async function improveDescription(productName: string, basicInfo: string): Promise<string> {
    return await api.post<string>('/v1/ai/generate-description', {
        productName,
        basicInfo
    });
}

export async function chatBotHelper(userQuestion: string): Promise<string>{
    return await api.post<string>('/v1/ai/generate-help-response', {
        userQuestion
    });
}