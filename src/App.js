import React, { useState, useCallback } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './App.css';

function App() {
  const [cards, setCards] = useState([]);
  const [connections, setConnections] = useState([]);
  const [idCounter, setIdCounter] = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [draggingConnection, setDraggingConnection] = useState(null);

  const addCard = () => {
    const newId = `card-${idCounter}`;
    const newCard = {
      id: newId,
      text: 'Some dummy text..',
      x: Math.random() * 400,
      y: Math.random() * 400,
    };
    setCards((prevCards) => [...prevCards, newCard]);
    setIdCounter(idCounter + 1);
  };

  const deleteCard = (id) => {
    setCards((prevCards) => prevCards.filter(card => card.id !== id));
    setConnections((prevConnections) => prevConnections.filter(conn => conn.start !== id && conn.end !== id));
  };

  const updateCardPosition = (id, x, y) => {
    setCards((prevCards) =>
      prevCards.map(card =>
        card.id === id ? { ...card, x, y } : card
      )
    );
  };

  const onStartConnection = (cardId, event) => {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    const cardElement = document.getElementById(cardId);
    const cardRect = cardElement.getBoundingClientRect();
    const startX = cardRect.right;
    const startY = cardRect.top + cardRect.height / 2;

    setDraggingConnection({
      startId: cardId,
      startX: startX,
      startY: startY,
      endX: startX,
      endY: startY,
    });
  };

  const onMouseMove = (event) => {
    if (draggingConnection) {
      setDraggingConnection({
        ...draggingConnection,
        endX: event.clientX,
        endY: event.clientY,
      });
    }
  };

  const onCompleteConnection = (cardId) => {
    if (draggingConnection && draggingConnection.startId !== cardId) {
      setConnections((prevConnections) => [
        ...prevConnections,
        { start: draggingConnection.startId, end: cardId }
      ]);
    }
    setDraggingConnection(null);
  };

  const handleCardDrag = useCallback((id) => (e, { x, y }) => {
    updateCardPosition(id, x, y);
  }, []);

  return (
    <div className="App" onMouseMove={onMouseMove} onMouseUp={() => setDraggingConnection(null)}>
      <button onClick={addCard}>Add Card</button>
      
      <div className="canvas">
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            id={card.id}
            text={card.text}
            x={card.x}
            y={card.y}
            onShowMore={() => setSelectedCard(card.id)}
            onStartConnection={(event) => onStartConnection(card.id, event)}
            onCompleteConnection={() => onCompleteConnection(card.id)}
            onDelete={deleteCard}
            onDrag={handleCardDrag(card.id)}
          />
        ))}
        <svg className="connections">
  <defs>
    <marker
      id="arrowhead"
      markerWidth="10"
      markerHeight="7"
      refX="10"
      refY="3.5"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <polygon points="0 0, 10 3.5, 0 7" fill="black" />
    </marker>
  </defs>
  {connections.map((conn, index) => (
    <ConnectionLine key={index} startId={conn.start} endId={conn.end} cards={cards} />
  ))}
  {draggingConnection && (
    <line
      x1={draggingConnection.startX}
      y1={draggingConnection.startY}
      x2={draggingConnection.endX}
      y2={draggingConnection.endY}
      stroke="black"
      strokeWidth="2"
      strokeDasharray="5,5"
      markerEnd="url(#arrowhead)"
    />
  )}
</svg>

      </div>
      {selectedCard && <Popup cardId={selectedCard} onClose={() => setSelectedCard(null)} />}
    </div>
  );
}

function DraggableCard({ id, text, x, y, onShowMore, onStartConnection, onCompleteConnection, onDelete, onDrag }) {
  const cardWidth = 200;
  const cardHeight = 200;

  return (
    <Draggable handle=".drag-handles" defaultPosition={{ x, y }} onDrag={onDrag}>
      <ResizableBox
        // style={{ backgroundColor: "gray" }}
        width={cardWidth}
        height={cardHeight}
        minConstraints={[150, 100]}
        maxConstraints={[300, 200]}
      >
        <div className="card-content" id={id} >
          <div className="drag-handles">
            Card {id}
          </div>
          <div style={{ padding: '10px', backgroundColor: "white", height: 'calc(100% - 40px)' }}>
            <p>{text}</p>
            <button onClick={onShowMore}>Show More</button>
            <button onClick={() => onDelete(id)}>Delete</button>

            {/* Dot icon for connection */}
            <div
              id={`connection-dot-${id}`} // Unique ID for the dot
              className="connection-dot"
              onMouseDown={(e) => onStartConnection(id, e)}
              onMouseUp={() => onCompleteConnection(id)}
              style={{
                position: 'absolute',
                right: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '15px',
                height: '15px',
                backgroundColor: '#000',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </ResizableBox>
    </Draggable>
  );
}



function ConnectionLine({ startId, endId, cards }) {
  const startCard = cards.find(card => card.id === startId);
  const endCard = cards.find(card => card.id === endId);

  if (!startCard || !endCard) return null;

  // Get the connection dot's positions
  const startDot = document.getElementById(`connection-dot-${startId}`);
  const endDot = document.getElementById(`connection-dot-${endId}`);

  if (!startDot || !endDot) return null;

  const startDotRect = startDot.getBoundingClientRect();
  const endDotRect = endDot.getBoundingClientRect();

  const startX = startDotRect.left + startDotRect.width / 2;
  const startY = startDotRect.top + startDotRect.height / 2;
  const endX = endDotRect.left + endDotRect.width / 2;
  const endY = endDotRect.top + endDotRect.height / 2;

  return (
    <line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      stroke="black"
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
    />
  );
}




function Popup({ cardId, onClose }) {
  return (
    <div className="popup">
      <div className="popup-content">
        <h3>Card {cardId} Details</h3>
        <p>This is the detailed text of card {cardId}...</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default App;
