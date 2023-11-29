import React from "react";
import { AiFillSignal } from "react-icons/ai";

export default function PropertyCard({ data }) {
  // name, value, star, conn
  return (
    <div className="rc-propertyBox">
      <p className="rc-propertyBox-propertyName">{data?.name}:</p>
      <p className="rc-propertyBox-propertyValue">{data?.value}</p>
      <div className="rc-propertyBox-data">
        <div className="rc-propertyBox-data-star">
          <div className="icon">
            <img src="/icon.png" alt="rarity checker icon" />
          </div>
          {data?.star}
        </div>
        <div className="rc-propertyBox-data-conn">
          <AiFillSignal />
          {data?.conn}
        </div>
      </div>
    </div>
  );
}
