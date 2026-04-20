import { useState, useRef, useEffect } from 'react';
import { Alert, Row, Col, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { chatBotHelper } from "~/services/AI/ai-service";

interface Message {
  text: string;
  isBot: boolean;
  img?: string;
}

export default function UserHelpCenter() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll mejorado: Solo desplaza el contenido interno del chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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

      {/* Informatión Cards */}
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