import { useState, useRef, useEffect } from 'react';
import { FiX, FiSend, FiUser } from 'react-icons/fi';
import { BsRobot } from 'react-icons/bs';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! 👋 I\'m BookLenDen Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    { id: 1, text: '📚 How to buy a book?' },
    { id: 2, text: '💰 How to sell a book?' },
    { id: 3, text: '📦 Order tracking' }
  ];

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes('buy') || message.includes('purchase')) {
      return {
        text: `📚 **How to Buy Books:**

1. Browse books or use search
2. Click on book → View details
3. Click "Add to Cart"
4. Go to Cart → Checkout
5. Fill shipping address
6. Choose payment (COD)
7. Place order! 🎉`,
        suggestions: ['Payment options', 'Track order']
      };
    }

    if (message.includes('sell') || message.includes('list')) {
      return {
        text: `💰 **How to Sell Books:**

1. Click "Sell Book" (top right)
2. Fill details (Title, Author, Price)
3. Upload clear photos
4. Click "List Book"
5. Your book goes live! 📖

**Tips:**
✅ Clear images
✅ Accurate description
✅ Competitive price`,
        suggestions: ['Pricing tips', 'Categories']
      };
    }

    if (message.includes('track') || message.includes('order')) {
      return {
        text: `📦 **Order Tracking:**

Go to: Profile → My Orders

**Statuses:**
🟡 Pending - Order received
🔵 Confirmed - Seller confirmed  
🟣 Shipped - In transit
🟢 Delivered - Received!`,
        suggestions: ['Cancel order', 'Contact seller']
      };
    }

    if (message.includes('payment') || message.includes('cod')) {
      return {
        text: `💳 **Payment Methods:**

**Cash on Delivery (COD)** ✅
- Pay when you receive
- No advance payment
- Safe & secure

**Online** (Coming Soon) 🔜`,
        suggestions: ['Refund policy']
      };
    }

    if (message.includes('contact') || message.includes('support')) {
      return {
        text: `📞 **Contact Support:**

**Email:** booklenden78@gmail.com
**Response:** 24-48 hours

We're here to help! 💙`,
        suggestions: ['Report issue']
      };
    }

    return {
      text: `I'm here to help! 😊

I can assist with:
📚 Buying & Selling
📦 Orders & Tracking
💳 Payments
🔐 Account issues

**Quick actions:**`,
      suggestions: ['How to buy', 'How to sell', 'Contact support']
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      
      const botMsg = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponse.text,
        suggestions: botResponse.suggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (text) => {
    setInputMessage(text);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      {/* Floating Chat Button - MOVED UP */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-6 w-16 h-16 bg-white rounded-full shadow-2xl hover:shadow-cyan-400/50 hover:scale-110 transition-all duration-300 z-[9999] group p-2 border-4 border-cyan-400"
          aria-label="Open chat"
        >
          {/* Your Custom Avatar */}
          <img 
            src="/chatbot-avatar.png"
            alt="BookLenDen Assistant" 
            className="w-full h-full object-cover rounded-full"
            style={{ imageRendering: 'crisp-edges' }}
          />
          
          {/* Blinking Green Dot */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
          </span>

          {/* Hover Tooltip */}
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Need help? Chat with us! 💬
          </span>
        </button>
      )}

      {/* Chat Window - MOVED UP */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden border border-gray-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-1 shadow-lg border-2 border-white/30">
                <img 
                  src="/chatbot-avatar.png"
                  alt="Assistant" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">BookLenDen Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-xs text-cyan-100">Online • Ready to help</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex items-start gap-2 ${
                    msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                    }`}
                  >
                    {msg.type === 'user' ? <FiUser size={16} /> : <BsRobot size={16} />}
                  </div>
                  
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                    <span className="text-xs opacity-60 mt-1.5 block">
                      {msg.timestamp.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>

                {/* Suggestions */}
                {msg.suggestions && (
                  <div className="ml-10 mt-2 flex flex-wrap gap-2">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(suggestion)}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 text-cyan-700 rounded-full text-xs hover:from-cyan-100 hover:to-blue-100 transition-all hover:scale-105 font-medium shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-sm">
                  <BsRobot size={16} />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-gray-200 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
              <p className="text-xs font-semibold text-gray-700 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleQuickReply(reply.text)}
                    className="px-3 py-1.5 bg-white border border-cyan-200 text-cyan-700 rounded-full text-xs hover:bg-cyan-50 transition-colors font-medium shadow-sm"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="w-11 h-11 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-cyan-500/50"
                aria-label="Send message"
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;