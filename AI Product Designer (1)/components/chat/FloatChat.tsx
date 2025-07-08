/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Message } from '../../types';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon, SparklesIcon, UserCircleIcon, LightBulbIcon } from '../icons';

interface FloatChatProps {
    isInitiallyOpen?: boolean;
    initialQuery?: string | null;
    onToggle?: (isOpen: boolean) => void;
    onQueryHandled?: () => void;
}

const MERYL_PERSONALITY = `
You are Meryl, an expert Print-on-Demand (POD) business mentor and a friendly AI assistant for the Merchize app.
Your personality is:
- **Friendly & Encouraging:** You're approachable, positive, and always supportive. Use emojis to add warmth! 😊
- **Knowledgeable & Expert:** You have deep knowledge of POD, e-commerce, design trends, marketing, and SEO.
- **Concise & Actionable:** Provide clear, direct answers. When giving advice, make it practical and easy to implement.
- **App-Aware:** You know all the features of the Merchize app and the content of the POD Mini Academy.
- **Proactive:** If a user asks a simple question, provide the answer and then offer a related tip or a "Did you know?" fact to help them succeed.

**MERCHIZE APP KNOWLEDGE BASE:**

*   **Dashboard:** Mission control. Shows "Trending Today," "Niche Explorer," and the "Top Keywords" table which uses Google Search for live data. 'Volume' = search interest, 'Competition' = how many sellers, 'Potential' = your AI score.
*   **AI Prompt Builder:** Turns ideas into detailed prompts for the AI image generator. Users can start with text or an image. Advise them to be descriptive: "Instead of 'dog shirt', try 'A watercolor painting of a golden retriever wearing a party hat'."
*   **Artwork Gallery:** Displays a grid of AI-generated images. Users select one to send to the Mockup Studio.
*   **Mockup Studio:** The main design canvas.
    *   **Left Panel:** Get more art from the "AI Generator," "Premium" library, or "Uploads." Add "Text".
    *   **Center:** The product mockup. Users drag/resize/rotate layers.
    *   **Right Panel:** Properties for the selected layer (size, rotation, etc.). Includes "AI Remove Background."
*   **Listing Generator:** The final step. The AI generates a "Title", "Description", and "Tags" which the user can edit before publishing.

**POD MINI ACADEMY KNOWLEDGE BASE:**

*   **Lesson 1: POD Foundations:**
    *   **What is it?** A business model where you sell custom-designed products without holding any inventory.
    *   **How it works:** 1. You create a design. 2. You list the product on a store. 3. A customer buys it. 4. Our suppliers print, pack, and ship it directly to the customer. 5. You keep the profit!
    *   **Pros:** No inventory costs, low risk, huge product variety.
    *   **Cons:** Lower profit margins than buying in bulk, you depend on the supplier for quality.

*   **Lesson 2: Niche Research:**
    *   **Why?** Selling to everyone = selling to no one. A niche is a specific group of people with a shared interest (e.g., corgi lovers, book club members, nurses who love coffee).
    *   **How to find one:** Think about passions, professions, hobbies, and life events. The Dashboard's "Niche Explorer" is a great place to start!
    *   **Validation:** A good niche has passionate fans who spend money, and isn't overly saturated. Use the "Top Keywords" table to check for "High" volume and "Low" or "Medium" competition.

*   **Lesson 3: Design & Copyright:**
    *   **What sells?** Designs that are unique, visually appealing, and connect with a niche's in-jokes or passions.
    *   **Technical stuff:** Always use high-resolution images (300 DPI is standard) to avoid blurry prints. The app's AI generator handles this for you!
    *   **CRITICAL RULE - Copyright/Trademark:** You CANNOT use other people's characters, logos, or brand names (e.g., Mickey Mouse, Nike, Harry Potter). This is illegal and will get your store shut down. Create original artwork or use elements you have a license for.

*   **Lesson 4: Marketing & SEO:**
    *   **What is SEO?** Search Engine Optimization. It's how customers find your product.
    *   **The 3 Kings:** Title, Description, and Tags. The app's Listing Generator uses AI to create these for you, which is a huge head start!
    *   **Good Titles:** Be descriptive. "Funny Corgi T-Shirt" is better than "Cool Shirt".
    *   **Good Tags:** Think like a customer. What words would they type to find your shirt? Use all 13 tags on Etsy!
    *   **Marketing:** Share your mockups on social media like Pinterest, Instagram, or in Facebook groups related to your niche.

When asked a question, answer it directly based on this knowledge base, and then offer to help further. Keep answers focused on helping the user succeed.
`;

export const FloatChat: React.FC<FloatChatProps> = ({ isInitiallyOpen = false, initialQuery = null, onToggle, onQueryHandled }) => {
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(process.env.API_KEY) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chatInstance = ai.chats.create({
                model: 'gemini-2.5-flash-preview-04-17',
                config: {
                    systemInstruction: MERYL_PERSONALITY,
                },
            });
            setChat(chatInstance);
        } else {
            console.warn("API_KEY not found. Meryl AI Chatbot is disabled.");
        }
    }, []);

    useEffect(() => {
        setIsOpen(isInitiallyOpen);
    }, [isInitiallyOpen]);
    
    useEffect(() => {
        // Automatically handle the initial query when the chat becomes visible
        if (isOpen && initialQuery && chat && !isLoading) {
            handleSend(initialQuery);
            if (onQueryHandled) {
                onQueryHandled();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialQuery, chat]);


    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const toggleChat = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (onToggle) {
            onToggle(newIsOpen);
        }
    };
    
    const handleSend = async (messageToSend?: string) => {
        const text = messageToSend || input;
        if (!text.trim() || isLoading) {
             if(!chat) {
                const errorMessage: Message = { role: 'model', content: "I'm having a little trouble connecting right now as my AI brain is not configured. Please try again later." };
                setMessages(prev => [...prev, errorMessage]);
            }
            return;
        }

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        
        if (!messageToSend) {
            setInput('');
        }
        setIsLoading(true);

        try {
            const result = await chat.sendMessage({ message: text });
            const modelMessage: Message = { role: 'model', content: result.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error: any) {
            console.error("Error sending message:", error);
            let errorMessageContent = "I'm having a little trouble connecting right now. Please try again in a moment.";
            if (error.message?.includes('RESOURCE_EXHAUSTED') || error.status === 429) {
                errorMessageContent = "I'm currently experiencing high demand! 😅 Please try again in a little while. In the meantime, did you know you can upload your own art in the Mockup Studio? It's a great way to use your existing designs!";
            }
            const errorMessage: Message = { role: 'model', content: errorMessageContent };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickNavs = [
        "What is Print-on-Demand?",
        "How do I find a niche?",
        "Give me tips for great designs.",
        "How do I market my shirts?"
    ];

    return (
        <>
            <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
                <div className="chat-widget">
                    <header className="chat-header">
                        <div className="chat-header-avatar"><SparklesIcon /></div>
                        <h3>Meryl, your AI Mentor</h3>
                    </header>
                    <div className="chat-body" ref={chatBodyRef}>
                        {messages.length === 0 && !isLoading && (
                            <>
                                <div className="chat-message model">
                                    <div className="message-avatar"><SparklesIcon /></div>
                                    <div className="message-content">
                                        Hi there! I'm Meryl. How can I help you grow your POD business today? 😊
                                    </div>
                                </div>
                                <div className="chat-quick-nav">
                                    <div className="dropdown-section-header">
                                        <LightBulbIcon/>
                                        <span>Quick Learning</span>
                                    </div>
                                    {quickNavs.map(nav => (
                                        <button key={nav} className="quick-nav-btn" onClick={() => handleSend(nav)}>
                                            {nav}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.role}`}>
                                <div className="message-avatar">
                                    {msg.role === 'model' ? <SparklesIcon /> : <UserCircleIcon />} 
                                </div>
                                <div className="message-content" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }}></div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message model">
                                <div className="message-avatar"><SparklesIcon /></div>
                                <div className="message-content typing"><span></span><span></span><span></span></div>
                            </div>
                        )}
                    </div>
                    <footer className="chat-input-area">
                        <textarea
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Meryl anything..."
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button className="chat-send-btn" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                            <PaperAirplaneIcon />
                        </button>
                    </footer>
                </div>
            </div>
            <button className={`float-chat-button ${isOpen ? 'open' : ''}`} onClick={toggleChat} aria-label={isOpen ? 'Close chat' : 'Open chat'}>
                <ChatBubbleLeftRightIcon className="icon-open" />
                <XMarkIcon className="icon-close" />
            </button>
        </>
    );
}