import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // If you have any CSS for your app
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const apiKey = "AIzaSyBPk4NYw_5enfX5-OJxYN14haaxFoQxiPM"; // Replace with your actual key

  useEffect(() => {
    setMessages([{
      text: "Hello! I'm THE SOP AI. How can I help you today with store procedures?",
      sender: 'ai'
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendToGemini = async (userQuestion) => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: `Question: ${userQuestion}\nAnswer:`
            }]
          }]
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      return aiResponse;
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
