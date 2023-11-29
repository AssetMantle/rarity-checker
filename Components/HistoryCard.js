import React from "react";
import { FiCodesandbox } from "react-icons/fi";

export default function HistoryCard({ title, subtitle }) {
  return (
    <section className="rc-historyCard">
      <div className="rc-historyCard-icon">
        <FiCodesandbox />
      </div>
      <div className="rc-historyCard-data">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}
