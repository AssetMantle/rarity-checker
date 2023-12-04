import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { INVALID_ASSET_ID, validateAssetId } from "../config";

export default function Home() {
  const [searchAssetId, setSearchAssetId] = useState("");
  const [searchAssetIdValidationText, setSearchAssetIdValidationText] =
    useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValidAssetId = validateAssetId(searchAssetId);
    if (isValidAssetId) {
      const localSearchAssetId = searchAssetId;
      setSearchAssetId("");
      setSearchAssetIdValidationText("");
      router.push(`/nft/${localSearchAssetId}`);
    } else {
      setSearchAssetIdValidationText(INVALID_ASSET_ID);
    }
  };

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
            <form>
              <input
                type="text"
                value={searchAssetId}
                onChange={(e) => setSearchAssetId(e.target.value)}
                className=""
                placeholder="Enter Asset ID"
              />
              <small>{searchAssetIdValidationText}</small>
              <button onClick={handleSubmit}>Try it for free</button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
