import React from "react";

export default function RCLogo({ hideSmall = false }) {
  return (
    <div className="rc-logo">
      <div className="icon">
        <img src="/icon.png" alt="rarity checker icon" />
      </div>
      <p className={`${hideSmall ? "hide-on-small" : ""}`}>
        How <span>Rare</span> Is Your NFT?
      </p>
    </div>
  );
}
