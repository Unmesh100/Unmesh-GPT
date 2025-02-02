import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IoMdSend } from "react-icons/io";
import { CiStar } from "react-icons/ci";
import ParticleNebula from './ParticleNebula';
import "./App.css";

const App = () => {
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const genAI = useMemo(() => new GoogleGenerativeAI(API_KEY), [API_KEY]);
  const scrollRef = useRef(null);

  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, isLoading]);

  const runGenerativeAI = useCallback(async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setConversation(prev => [...prev, { role: 'user', text: userInput }]);
    setUserInput('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContentStream(userInput);
      const response = await result.response;
      const generatedCode = response.text();

      const codeBlocks = generatedCode.split('```');
      const formattedBlocks = codeBlocks.map((block, index) => (
        index % 2 === 0 ? (
          <ReactMarkdown key={index}>{block}</ReactMarkdown>
        ) : (
          <div className="code-block" key={index}>
            <div className="copy-button" onClick={() => copyToClipboard(block)}>
              Copy
            </div>
            <SyntaxHighlighter language="javascript" style={a11yDark}>
              {block}
            </SyntaxHighlighter>
          </div>
        )
      ));

      setConversation(prev => [
        ...prev,
        { role: 'gemini', text: formattedBlocks },
      ]);
    } catch (error) {
      console.error(error);
      setConversation(prev => [
        ...prev,
        { role: 'error', text: 'Error: Content blocked due to safety concerns.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [genAI, userInput]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (userInput.trim() !== '' && !isLoading) {
        runGenerativeAI();
      }
    }
  };

  const handleSend = () => {
    if (userInput.trim() !== '' && !isLoading) {
      runGenerativeAI();
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="app">
      <div className="particle-background">
        <ParticleNebula />
      </div>
      <div className="content-overlay">
        <div className="right-heading">
          <a href="https://twitter.com/Unmesh100" target='blank' className="footer-icon">
            <h1>Unmesh GPT</h1>
          </a>
        </div>
        <div className="github-button">
          <a href="https://github.com/Unmesh100/Unmesh-GPT" target="blank">
            <CiStar />Star this Repo
          </a>
        </div>
        <div className="chat-container">
          <div className="scrollable-content" ref={scrollRef}>
            {conversation.map((message, index) => (
              <div
                key={index}
                className={message.role === 'user'
                  ? 'user-message'
                  : message.role === 'error'
                    ? 'error-message'
                    : 'gemini-message'}
              >
                {message.role === 'gemini' ? (
                  message.text
                ) : (
                  message.text
                )}
              </div>
            ))}
            {isLoading && (
              <div className="gemini-message loading-message">
                <div className="chat-bubble">
                  <div className="loading-dots">
                    <div className="loading-dots--dot"></div>
                    <div className="loading-dots--dot"></div>
                    <div className="loading-dots--dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="input-container">
          <textarea
            placeholder="Ask a question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="input-textarea"
          />
          <button 
            className={`send-button ${isLoading ? 'disabled' : ''}`} 
            onClick={handleSend}
            disabled={isLoading || !userInput.trim()}
          >
            <IoMdSend />
          </button>
        </div>
        <div className="footer" id='footer'>
          <footer className="custom-footer">
            <div className="custom-container">
              <div className="footer-social-icons">
                <a href="https://twitter.com/Unmesh100" target='blank' className="footer-icon">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1684 408q-67 98-162 167 1 14 1 42 0 130-38 259.5t-115.5 248.5-184.5 210.5-258 146-323 54.5q-271 0-496-145 35 4 78 4 225 0 401-138-105-2-188-64.5t-114-159.5q33 5 61 5 43 0 85-11-112-23-185.5-111.5t-73.5-205.5v-4q68 38 146 41-66-44-105-115t-39-154q0-88 44-163 121 149 294.5 238.5t371.5 99.5q-8-38-8-74 0-134 94.5-228.5t228.5-94.5q140 0 236 102 109-21 205-78-37 115-142 178 93-10 186-50z">
                    </path>
                  </svg>
                </a>
                <a href="https://github.com/Unmesh100" target='blank' className="footer-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 1792 1792">
                    <path d="M896 128q209 0 385.5 103t279.5 279.5 103 385.5q0 251-146.5 451.5t-378.5 277.5q-27 5-40-7t-13-30q0-3 .5-76.5t.5-134.5q0-97-52-142 57-6 102.5-18t94-39 81-66.5 53-105 20.5-150.5q0-119-79-206 37-91-8-204-28-9-81 11t-92 44l-38 24q-93-26-192-26t-192 26q-16-11-42.5-27t-83.5-38.5-85-13.5q-45 113-8 204-79 87-79 206 0 85 20.5 150t52.5 105 80.5 67 94 39 102.5 18q-39 36-49 103-21 10-45 15t-57 5-65.5-21.5-55.5-62.5q-19-32-48.5-52t-49.5-24l-20-3q-21 0-29 4.5t-5 11.5 9 14 13 12l7 5q22 10 43.5 38t31.5 51l10 23q13 38 44 61.5t67 30 69.5 7 55.5-3.5l23-4q0 38 .5 88.5t.5 54.5q0 18-13 30t-40 7q-232-77-378.5-277.5t-146.5-451.5q0-209 103-385.5t279.5-279.5 385.5-103zm-477 1103q3-7-7-12-10-3-13 2-3 7 7 12 9 6 13-2zm31 34q7-5-2-16-10-9-16-3-7 5 2 16 10 10 16 3zm30 45q9-7 0-19-8-13-17-6-9 5 0 18t17 7zm42 42q8-8-4-19-12-12-20-3-9 8 4 19 12 12 20 3zm57 25q3-11-13-16-15-4-19 7t13 15q15 6 19-6zm63 5q0-13-17-11-16 0-16 11 0 13 17 11 16 0 16-11zm58-10q-2-11-18-9-16 3-14 15t18 8 14-14z">
                    </path>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/unmesh-ghosh/" target='blank' className="footer-icon">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                    <path d="M477 625v991h-330v-991h330zm21-306q1 73-50.5 122t-135.5 49h-2q-82 0-132-49t-50-122q0-74 51.5-122.5t134.5-48.5 133 48.5 51 122.5zm1166 729v568h-329v-530q0-105-40.5-164.5t-126.5-59.5q-63 0-105.5 34.5t-63.5 85.5q-11 30-11 81v553h-329q2-399 2-647t-1-296l-1-48h329v144h-2q20-32 41-56t56.5-52 87-43.5 114.5-15.5q171 0 275 113.5t104 332.5z">
                    </path>
                  </svg>
                </a>
              </div>
              <div className="copyright">
                <a href="https://github.com/Unmesh100/Unmesh-GPT" target='blank'>
                  Made with ❤️ By Unmesh
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;