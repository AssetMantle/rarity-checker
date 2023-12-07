"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiFillSignal } from "react-icons/ai";
import PropertyCard from "../../Components/PropertyCard";

// for fetch
import {
  INVALID_ASSET_ID,
  getCollectionData,
  queryAssetId,
  searchForAssetId,
  validateAssetId,
} from "../../config";

function nftDetail({ nftDataList }) {
  const router = useRouter();

  const NftID = router.query.id;

  const [SearchNftID, setSearchNftID] = useState(router.query.id);
  const [nftData, setNftData] = useState({});
  const [collectionData, setCollectionData] = useState({});
  const [NftPropertyRaw, setNftPropertyRaw] = useState([]);

  const NftPropertyData = [...NftPropertyRaw].filter(
    (el) => el.assetId === NftID
  )[0];

  const [Loading, setLoading] = useState(true);

  const isNftListPopulated = nftDataList?.length || 0;

  useEffect(() => {
    (async () => {
      const fetchedCollectionsData = await getCollectionData();
      setCollectionData(fetchedCollectionsData);
    })();
    Promise.resolve(queryAssetId(NftID)).then((res) => setNftData(res));
    setLoading(false);
  }, []);

  const [searchAssetIdValidationText, setSearchAssetIdValidationText] =
    useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValidAssetId = validateAssetId(SearchNftID);
    if (isValidAssetId) {
      const localSearchAssetId = SearchNftID;
      // setSearchNftID("");
      setSearchAssetIdValidationText("");
      router.push(`/nft/${localSearchAssetId}`);
    } else {
      setSearchAssetIdValidationText(INVALID_ASSET_ID);
    }
  };

  // console.log(props.data);

  const nftDisplayJSX = isNftListPopulated ? (
    <section className="rc-nft-container">
      <div className="rc-nft-container-preview">
        <div className={`rc-nft-container-preview-image`}>
          <img
            src={collectionData?.contract?.metadata?.thumbnail_url}
            className={``}
          />
        </div>
      </div>

      <div className="rc-nft-container-data">
        <div className="rc-nft-container-data-title">
          <p>
            {nftData?.classificationIDBase64
              ? nftData.classificationIDBase64
              : "NFT Collection name"}
          </p>
          <h1>{nftData?.assetIDBase64 ? nftData.assetIDBase64 : "NFT Name"}</h1>
        </div>

        {NftPropertyData && (
          <div className="rc-nft-container-data-rarity">
            <p className="rc-nft-container-data-rarity-rank">
              <AiFillSignal /> {NftPropertyData?.rank}
            </p>
            <i className="rc-divider-vertical" />
            <p className="rc-nft-container-data-rarity-score">
              Rarity Score : {NftPropertyData?.totalRarityScore}
            </p>
          </div>
        )}

        <p>
          NFT ID: <span>{NftID}</span>
        </p>
        <div className="rc-divider"></div>

        {NftPropertyData?.properties &&
        Array.isArray(NftPropertyData.properties) &&
        NftPropertyData.properties.length > 0 ? (
          <div className="rc-nft-container-data-properties">
            {React.Children.toArray(
              NftPropertyData.properties.map((item) => (
                <PropertyCard
                  data={{
                    name: item?.propertyName,
                    value:
                      item?.propertyType === "mesa"
                        ? "***"
                        : item?.propertyValue,
                    star: item?.rarityScore,
                    conn: `${Math.round(
                      (1 / item?.rarityScore) * NftPropertyRaw?.length
                    )}/${NftPropertyRaw?.length}`,
                  }}
                />
              ))
            )}
          </div>
        ) : (
          <>
            <p>
              To know individual property rarity scores, click below to generate
              rarity report{" "}
            </p>
            <button onClick={() => setNftPropertyRaw(nftDataList)}>
              Generate Rarity Report
            </button>
          </>
        )}
      </div>
    </section>
  ) : (
    <section className="rc-nft-container">
      <div className="rc-nft-container-preview">
        <div className="rc-nft-container-preview-image">
          <img src={`/not_found_nft.png`} className="h-24 w-24 rounded-lg" />
        </div>
      </div>

      <div className="rc-nft-container-data">
        <div className="rc-nft-container-data-title">
          <h1>NFT Not Found</h1>
        </div>
        <div className="rc-divider"></div>
        <p>
          The NFT ID you searched was not found. Please check NFT ID or try
          again.
        </p>
      </div>
    </section>
  );

  console.log(nftData, NftPropertyData);

  return (
    <main className="rc-container rc-nft">
      <section className="rc-nft-form">
        <input
          type="text"
          value={SearchNftID}
          onChange={(e) => setSearchNftID(e.target.value)}
          className=""
          placeholder="Enter Asset ID"
        />

        <button onClick={handleSubmit}>Check NFT Rarity</button>
        <small>{searchAssetIdValidationText}</small>
      </section>
      <i className="rc-divider"></i>
      {nftDisplayJSX}

      {Loading && (
        <div className="rc-container rc-nft-loading">
          <p>Scanning through NFTs...</p>
        </div>
      )}
    </main>
  );
}

export async function getStaticProps({ params }) {
  const nftDataList = await searchForAssetId(params.id);

  return {
    props: {
      nftDataList,
    },
    revalidate: 300, // In seconds
  };
}

export async function getStaticPaths() {
  const paths = [];

  return { paths, fallback: "blocking" };
}

export default nftDetail;
