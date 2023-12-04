import React, { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [searchAssetId, setSearchAssetId] = useState("");

  return (
    <>
      <main
        className="rc-container rc-home"
        style={{ backgroundImage: "url(/bg.png)" }}
      >
        <div className="rc-home-container">
          <h1>
            Check your <span>NFT Rarity Score</span> for Free!
          </h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros{" "}
          </p>
          <div className="rc-home-container-form">
            <input
              type="text"
              value={searchAssetId}
              onChange={(e) => setSearchAssetId(e.target.value)}
              className=""
              placeholder="Enter Asset ID"
            />
            <Link
              href={`/nft/${searchAssetId}`}
              // onClick={searchForAssetId}
              className=""
            >
              Try it for free
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
