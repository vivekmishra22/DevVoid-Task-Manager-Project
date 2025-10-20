import React, { useState } from 'react';
import { summarizeProject, askQuestion } from '../services/api';

const AIChat = ({ projectId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const response = await summarizeProject(projectId);
      
      if (response.data && response.data.summary) {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: response.data.summary,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        throw new Error('No summary received');
      }
    } catch (error) {
      console.error('Summary error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to get project summary. Please try again.';
      setMessages(prev => [...prev, {
        type: 'error',
        content: `❌ ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const question = inputMessage.trim();
    if (!question) return;

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString()
    }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askQuestion(projectId, question);
      
      if (response.data && response.data.answer) {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: response.data.answer,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        throw new Error('No answer received');
      }
    } catch (error) {
      console.error('Question error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to get response. Please try again.';
      setMessages(prev => [...prev, {
        type: 'error',
        content: `❌ ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat">
        <div className="ai-chat-header">
          <h3>🤖 AI Project Assistant</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="ai-actions">
          <button 
            className="btn-primary"
            onClick={handleSummarize}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Analyzing...' : '📊 Summarize Project'}
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>💡 Ask me anything about your project tasks and progress!</p>
              <p>Try:</p>
              <ul>
                <li>"What tasks are in progress?"</li>
                <li>"How many tasks are completed?"</li>
                <li>"What should I work on next?"</li>
              </ul>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.type}`}
              >
                <div className="message-content">
                  {message.content.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
                <div className="message-time">
                  {message.timestamp}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span>🤔</span> AI is thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about tasks, progress, priorities..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputMessage.trim()}>
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;

// import React, { useState } from 'react';
// import { summarizeProject, askQuestion } from '../services/api';

// const AIChat = ({ projectId, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSummarize = async () => {
//     setIsLoading(true);
//     try {
//       const response = await summarizeProject(projectId);
//       setMessages(prev => [...prev, {
//         type: 'ai',
//         content: response.data.summary,
//         timestamp: new Date().toLocaleTimeString()
//       }]);
//     } catch (error) {
//       console.error('Error getting summary:', error);
//       setMessages(prev => [...prev, {
//         type: 'error',
//         content: 'Failed to get project summary. Please try again.',
//         timestamp: new Date().toLocaleTimeString()
//       }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputMessage.trim()) return;

//     // Add user message
//     const userMessage = {
//       type: 'user',
//       content: inputMessage,
//       timestamp: new Date().toLocaleTimeString()
//     };
    
//     setMessages(prev => [...prev, userMessage]);
//     setInputMessage('');
//     setIsLoading(true);

//     try {
//       const response = await askQuestion(projectId, inputMessage);
//       setMessages(prev => [...prev, {
//         type: 'ai',
//         content: response.data.answer,
//         timestamp: new Date().toLocaleTimeString()
//       }]);
//     } catch (error) {
//       console.error('Error asking question:', error);
//       setMessages(prev => [...prev, {
//         type: 'error',
//         content: 'Failed to get response. Please try again.',
//         timestamp: new Date().toLocaleTimeString()
//       }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="ai-chat-overlay">
//       <div className="ai-chat">
//         <div className="ai-chat-header">
//           <h3>🤖 AI Assistant</h3>
//           <button className="btn-close" onClick={onClose}>×</button>
//         </div>

//         <div className="ai-actions">
//           <button 
//             className="btn-primary"
//             onClick={handleSummarize}
//             disabled={isLoading}
//           >
//             {isLoading ? 'Generating...' : 'Summarize Project'}
//           </button>
//         </div>

//         <div className="chat-messages">
//           {messages.length === 0 ? (
//             <div className="empty-chat">
//               <p>Ask me anything about your project or get a summary!</p>
//             </div>
//           ) : (
//             messages.map((message, index) => (
//               <div 
//                 key={index} 
//                 className={`message ${message.type}`}
//               >
//                 <div className="message-content">
//                   {message.content}
//                 </div>
//                 <div className="message-time">
//                   {message.timestamp}
//                 </div>
//               </div>
//             ))
//           )}
//           {isLoading && (
//             <div className="message ai">
//               <div className="message-content">
//                 <div className="typing-indicator">
//                   <span></span>
//                   <span></span>
//                   <span></span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <form onSubmit={handleSendMessage} className="chat-input">
//           <input
//             type="text"
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             placeholder="Ask a question about your project..."
//             disabled={isLoading}
//           />
//           <button type="submit" disabled={isLoading || !inputMessage.trim()}>
//             Send
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AIChat;