import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicSops, setDynamicSops] = useState([]);
  const messagesEndRef = useRef(null);

  const apiKey = "AIzaSyBPk4NYw_5enfX5-OJxYN14haaxFoQxiPM"; // Replace with your actual key

  useEffect(() => {
    setMessages([{
      text: "Hello! I'm THE SOP AI. How can I help you today with store procedures?",
      sender: 'ai'
    }]);

    const fetchSOPData = async () => {
      try {
        const filenames = [
          "Merchandise%20Holds.pdf",
          "Ringing%20Sequence%2011.28.pdf",
          "SOP%20-%20Product%20Recall.pdf",
          "SOP%20-%20Returns.pdf"
        ];

        const fetchedSops = await Promise.all(
          filenames.map(async (file) => {
            const response = await fetch(`http://localhost:5000/api/sop/${file}`);
            const data = await response.json();
            return {
              title: decodeURIComponent(file.replace(".pdf", "")),
              content: extractTextFromPdf2Json(data),
              category: "POS & Front End"
            };
          })
        );

        setDynamicSops(fetchedSops);
      } catch (err) {
        console.error("Failed to fetch SOPs:", err);
      }
    };

    fetchSOPData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const extractTextFromPdf2Json = (pdfData) => {
    let text = "";
    pdfData?.formImage?.Pages?.forEach(page => {
      page.Texts?.forEach(item => {
        const decoded = decodeURIComponent(item.R[0].T);
        text += decoded + " ";
      });
    });
    return text.trim().split(/\n{2,}/); // break into chunks
  };

  const createContext = () => {
    let context = "You are THE SOP AI, an expert assistant trained on the company's Standard Operating Procedures.\n\n";
    
    dynamicSops.forEach(sop => {
      context += `CATEGORY: ${sop.category}\n`;
      context += `TITLE: ${sop.title}\n`;
      context += `CONTENT:\n${sop.content.join("\n")}\n\n`;
    });

    return context;
  };

  const sendToGemini = async (userQuestion) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: createContext() + `Question: ${userQuestion}\nDo NOT use markdown format! Respond like a profession robotic district manager. Make sure you read the sops.json file in depth before answering any question. Only use plain text. Answer:`
            }]
          }]
        })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error.message || "Error with Gemini API");

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error with Gemini API:', error);
      return "Sorry, I encountered an error while processing your request.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiResponse = await sendToGemini(input);
    const aiMessage = { text: aiResponse, sender: 'ai' };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="app">
      <div className="chat-container">
        <header className="chat-header">
          <h1>THE SOP AI</h1>
          <p>Your retail assistant for Standard Operating Procedures</p>
        </header>

        <div className="messages-area">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="message ai loading">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about store procedures..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
