/**
 * User Help Center / Support Page
 *
 * Interactive support page with FAQ and AI-powered chatbot assistant.
 * Provides self-service help for common marketplace questions.
 *
 * Features:
 * - FAQ cards with common questions:
 *    - How do I sell?
 *    - How do I buy?
 *    - Secure Payments (escrow system)
 *    - Account Settings
 *    - Shipping & Returns
 *    - Community Guidelines
 * - AI Assistant chatbot:
 *    - Real-time messaging interface
 *    - Chat history display
 *    - Powered by chatBotHelper() AI service
 *    - Loading state while generating responses
 *    - Can reference user profile photos if mentioned
 * - Support contact section:
 *    - Email contact information
 *    - Support hours
 *    - Alternative contact methods
 *
 * Data Flow:
 * 1. User navigates to /user-help-center
 * 2. Component renders FAQ cards immediately
 * 3. User types question in AI assistant input field
 * 4. On send (form submit):
 *    - Message added to chat display (user side)
 *    - Input cleared and focus reset
 *    - Loading state set to true
 *    - chatBotHelper(question) API called
 * 5. Bot response received and displayed
 *    - If question mentions "photo", attach image
 *    - Format response with proper styling
 * 6. Loading state cleared
 * 7. Chat auto-scrolls to latest message
 * 8. User can continue conversation or click FAQ links
 *
 * AI Assistant State:
 * - messages: Array of {text, isBot, img?}
 * - input: Current text in input field
 * - isLoading: True while API call in progress
 * - chatContainerRef: For auto-scroll functionality
 *
 * Chat Features:
 * - User messages: Right-aligned, blue background
 * - Bot messages: Left-aligned, white background
 * - Images optional (if bot response includes media)
 * - Loading spinner during response generation
 * - Scrolls automatically to latest message
 * - Prevents sending empty messages
 * - Prevents multiple sends while loading
 *
 * FAQ Categories:
 * - Selling: "How do I sell?" - Create listings, set prices
 * - Payments: "Secure Payments" - Escrow and fund protection
 * - Buying: "How do I buy?" - Browse, offer, checkout
 * - Account: "Account Settings" - Profile, preferences
 * - Shipping: "Shipping & Returns" - Delivery, returns policy
 * - Community: "Community Guidelines" - Etiquette, policies
 *
 * Error Handling:
 * - Try-catch in handleSendMessage
 * - Bot error message on API failure
 * - Graceful fallback: "Service temporarily unavailable"
 * - Always sets isLoading to false in finally block
 *
 * Styling:
 * - Chat container: Light gray background, scrollable
 * - Messages: Rounded corners, shadow, max-width 85%
 * - Input: Rounded pill shape, shadow
 * - FAQ cards: Clay design, icon + description
 * - Responsive: Single column mobile, 2 columns desktop
 *
 * Accessibility:
 * - Proper form semantics with Submit
 * - Alt text for images
 * - ARIA labels implied through structure
 * - Font sizes readable on all devices
 * - Color contrast sufficient for accessibility
 *
 * Performance:
 * - Lazy chat history (not paginated)
 * - Auto-scroll only on new messages
 * - Loading state prevents duplicate submissions
 * - No pre-fetching of FAQ content
 *
 * @component
 * @returns Help center page with FAQ and AI chatbot
 */

import { useState, useRef, useEffect } from 'react';
import { Alert, Row, Col, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { chatBotHelper } from "~/services/AI/ai-service";

/**
 * Chat Message Type Definition
 * 
 * Represents a single message in the chat history.
 * Can be from user or bot, with optional image attachment.
 */
interface Message {
  text: string;      // Message text content
  isBot: boolean;    // True if from AI bot, false if from user
  img?: string;      // Optional image URL (for bot responses with images)
}

/**
 * User Help Center Component Implementation
 * 
 * Renders FAQ section and AI chatbot for customer support.
 */
export default function UserHelpCenter() {
  // Chat history state: Array of user and bot messages
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello. How can I help you today?", isBot: true }
  ]);
  
  // Current input field value
  const [input, setInput] = useState("");
  
  // Loading state while waiting for AI response
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to chat container for auto-scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll Chat to Latest Message
   * 
   * Effect: Runs whenever messages array or loading state changes
   * Purpose: Keep latest message visible (smooth chat experience)
   * Scrolls to bottom of chat container
   */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /**
   * Handle Send Message in AI Chat
   * 
   * Process:
   * 1. Prevent default form submission
   * 2. Trim user input and validate (no empty messages)
   * 3. Prevent sending if already loading (avoid duplicate API calls)
   * 4. Add user message to chat history immediately (for UX)
   * 5. Clear input field
   * 6. Set loading state to true
   * 7. Call chatBotHelper() to get AI response
   * 8. Check if user asked about "photo" for image attachment
   * 9. Add bot response to chat history
   * 10. Handle errors with fallback message
   * 11. Clear loading state
   * 12. Auto-scroll shows latest message
   * 
   * @param e - React form event
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userText = input.trim();
    if (!userText || isLoading) return;

    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatBotHelper(userText);
      let botMsg: Message = { text: response, isBot: true };
      
      if (userText.toLowerCase().includes("photo")) {
        botMsg.img = `/api/v1/users/search/profile-photo?name=user1`; 
      }

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        text: "Service temporarily unavailable. Please try again later.", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="mb-5">
        <h1 className="fw-800 h2 text-dark mb-2">Help Center</h1>
        <p className="text-muted small fw-600 mb-0">Everything you need to know about Stilnovo.</p>
      </header>

      {/* Information cards section - displays FAQ categories with icons and descriptions */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="clay-card border-0 h-100 p-2 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="fa-solid fa-box text-primary fs-3"></i>
                <h5 className="fw-bold mb-0 text-dark">How do I sell?</h5>
              </div>
              <p className="text-muted small mb-0 fw-500">
                Upload your items through the create listing section, set your price, and wait for buyers.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="clay-card border-0 h-100 p-2 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="fa-solid fa-lock text-primary fs-3"></i>
                <h5 className="fw-bold mb-0 text-dark">Secure Payments</h5>
              </div>
              <p className="text-muted small mb-0 fw-500">
                We protect transactions via escrow. Funds are released only after delivery confirmation.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* AI Assistant Section */}
      <Card className="clay-card border-0 p-3 p-md-4 mb-5 bg-white shadow-sm rounded-4">
        <Card.Body>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}}>
              <i className="fa-solid fa-robot text-white small"></i>
            </div>
            <h5 className="fw-bold text-dark mb-0">
              <i className="fa-solid me-2"></i>Stilnovo AI Expert
            </h5>
          </div>

          <div 
            className="chat-container mb-2 p-3 rounded-4" 
            ref={chatContainerRef}
            style={{ height: '220px', overflowY: 'auto', backgroundColor: '#f8fafc', border: '1px solid #edf2f7' }}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`d-flex ${msg.isBot ? 'justify-content-start' : 'justify-content-end'} mb-2`}>
                <div className={`p-3 rounded-4 shadow-sm ${msg.isBot ? 'bg-white text-dark border' : 'bg-primary text-white'}`} style={{ maxWidth: '85%', fontSize: '0.9rem' }}>
                  <p className="mb-0 fw-500">{msg.text}</p>
                  {msg.img && (
                    <img 
                      src={msg.img} 
                      alt="Preview" 
                      className="mt-2 rounded-3 d-block shadow-sm" 
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  )}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-start mt-1"><Spinner animation="grow" size="sm" variant="primary" /></div>}
          </div>

          <Form onSubmit={handleSendMessage}>
            <InputGroup className="rounded-pill shadow-sm overflow-hidden border bg-white p-1">
              <Form.Control
                className="border-0 py-2 px-4 fw-500 shadow-none"
                placeholder="Ask me something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ backgroundColor: '#ffffff', fontSize: '0.9rem' }}
              />
              <Button type="submit" variant="primary" className="rounded-pill px-4 fw-bold" disabled={isLoading} style={{ fontSize: '0.9rem' }}>
                {isLoading ? "..." : "Ask"}
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Support Section */}
      <Card className="clay-card border-0 p-3 p-md-4 mb-5 shadow-sm rounded-4">
        <Card.Body>
          <h5 className="fw-bold text-dark mb-3">Still need help?</h5>
          <p className="text-muted small fw-600 mb-4">
            Our specialized support team is available via traditional channels.
          </p>

          <Row className="g-4 mb-4">
            <Col md={6}>
              <div className="p-4 bg-light rounded-4 text-center border h-100">
                <i className="fa-solid fa-envelope text-primary fs-2 mb-3"></i>
                <h6 className="fw-bold text-dark mb-2">Email Support</h6>
                <a href="mailto:support@stilnovo.com" className="text-decoration-none text-primary fw-bold">
                  support@stilnovo.com
                </a>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-4 bg-light rounded-4 text-center border h-100">
                <i className="fa-solid fa-phone text-primary fs-2 mb-3"></i>
                <h6 className="fw-bold text-dark mb-2">Phone Support</h6>
                <div className="text-muted fw-bold small">+34 912 345 678</div>
              </div>
            </Col>
          </Row>

          <Alert variant="info" className="border-0 rounded-4 mb-0 d-flex align-items-center gap-3 py-3 fw-600 shadow-sm">
            <i className="fa-solid fa-circle-info fs-4"></i>
            <span className="text-dark">
              <strong>Response time:</strong> Usually less than 24 hours.
            </span>
          </Alert>
        </Card.Body>
      </Card>
    </>
  );
}