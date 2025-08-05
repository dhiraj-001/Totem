import { useEffect } from 'react';

declare global {
  interface Window {
    RankVedChatbotConfig: any;
  }
}

interface ChatWidgetProps {
  chatbotId: string;
  config?: {
    apiUrl?: string;
    frontendUrl?: string;
    [key: string]: any;
  };
}

const ChatWidget = ({ chatbotId, config = {} }: ChatWidgetProps) => {
  useEffect(() => {
    // Use same URL pattern as embed page
    const backendUrl = 'https://rankved-backend.onrender.com';
    const frontendUrl = 'https://rank-ved-frontend-rfam.vercel.app';
    
    // Set configuration
    window.RankVedChatbotConfig = {
      chatbotId,
      apiUrl: config.apiUrl || backendUrl,
      frontendUrl: config.frontendUrl || frontendUrl,
      ...config
    };
    
    // Load chatbot script
    const script = document.createElement('script');
    script.src = `${window.RankVedChatbotConfig.frontendUrl}/chatbot-loader.js`;
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="chatbot-loader.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [chatbotId, config]);

  return null;
};

export default ChatWidget;