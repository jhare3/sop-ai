import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Your custom styles if needed

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sopData, setSopData] = useState(null); // Store SOP data
  const messagesEndRef = useRef(null);

  const apiKey = "AIzaSyBPk4NYw_5enfX5-OJxYN14haaxFoQxiPM";  // Replace with your actual key

  // Asynchronously load SOP data after the page has loaded
  useEffect(() => {
    const fetchSopData = async () => {
      try {
        const response = await fetch('/pdf_output.json');  // Adjust the path as needed
        const data = await response.json();
        setSopData(data);  // Store SOP data in state
      } catch (error) {
        console.error('Error fetching SOP data:', error);
      }
    };

    fetchSopData(); // Fetch SOP data asynchronously
  }, []);

  useEffect(() => {
    setMessages([{
      text: "Hello! I'm THE SOP AI. How can I help you today with store procedures?",
      sender: 'ai'
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send query to Gemini with SOP context
  const sendToGemini = async (userQuestion) => {
    try {
      const context = sopData ? JSON.stringify(sopData) : 'No SOP data available';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Respond to the user query: ${userQuestion}\n\nSOP Context: ${context}\n\nDo NOT use markdown format! Respond from the point of view of a super genius store manager. Only respond in plain text with NO formatting.`
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

  // Handle user query submission
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
