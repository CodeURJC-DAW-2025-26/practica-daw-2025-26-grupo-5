import { create } from 'zustand';

interface Message {
    text: string;
    isBot: boolean;
}

interface ChatStore {
    isOpen: boolean;
    messages: Message[];
    setIsOpen: (open: boolean) => void;
    addMessage: (text: string, isBot: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    isOpen: false,
    messages: [{ text: "Hello! I am your Stilnovo Assistant. How can I help you?", isBot: true }],
    setIsOpen: (open) => set({ isOpen: open }),
    addMessage: (text, isBot) => set((state) => ({
        messages: [...state.messages, { text, isBot }]
    })),
}));