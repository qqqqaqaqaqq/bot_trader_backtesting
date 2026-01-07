import React from "react";
import './styles/promptCards.css';

const PromptCards = ({ prompts }) => {
  return (
    <div className="prompt-cards-container">
      {Object.entries(prompts).map(([key, value]) => (
        <div key={key} className="prompt-card">
          <h3 className="prompt-title">{key}</h3>
          <pre className="prompt-content">{value}</pre>
        </div>
      ))}
    </div>
  );
};

export default PromptCards;