"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PropertyCard from "../../Components/PropertyCard";

function nftDetail() {
  const [NftID, setNftID] = useState();
  const [nftData, setNftData] = useState([]);
  const [collectionData, setCollectionData] = useState({});
  const [NftPropertyData, setNftPropertyData] = useState([]);
  const [Loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setNftID(router.query.id);
  }, [router]);

  const getNFTData = () => {
    const nftId = router.query.id;
    setNftID(nftId);
    if (nftId) {
      fetch("../data/ethereumData.json")
        .then(function (response) {
          return response.json();
        })
        .then(function (myJson) {
          const filteredData = myJson.filter(
            (nft) => nft.token_id === nftId
          )[0];
          setNftData(filteredData);
          const combinedArray = filteredData?.metadata.attributes.map(
            (item, index) => {
              const matchingObject = filteredData.attributes.find(
                (obj) => obj.trait_type === item.trait_type
              );
              return {
                ...item,
                ...matchingObject,
              };
            }
          );
          setNftPropertyData(combinedArray);
        });
    }
  };
  useEffect(() => {
    getNFTData();
  }, [router]);

  const getCollectionData = () => {
    fetch("../data/ethCollectionData.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setCollectionData(myJson);
      });
  };

  useEffect(() => {
    getCollectionData();
  }, []);

  return (
    <main className="rc-container rc-nft">
      <section className="rc-nft-form">
        <input
          type="text"
          value={NftID}
          onChange={(e) => setNftID(e.target.value)}
          className=""
          placeholder="Enter Asset ID"
        />
        <button onClick={() => false} className="">
          Check NFT Rarity
        </button>
      </section>
      <i className="rc-divider"></i>

      {!nftData ? (
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
              <p>{collectionData?.contract?.name}</p>
              <h1>{nftData?.name ? nftData.name : "NFT Name"}</h1>
            </div>
            <p>
              NFT ID: <span>{NftID}</span>
            </p>
            <div className="rc-divider"></div>
            <p>
              To know individual property rarity scores, click below to generate
              rarity report{" "}
            </p>
            {!NftPropertyData ? (
              <div className="rc-nft-container-data-properties">
                {React.Children.toArray(
                  [
                    {
                      name: "Property Name",
                      value: "Property Value",
                      star: "1.2",
                      conn: "3/3",
                    },
                    {
                      name: "Property Name",
                      value: "Property Value",
                      star: "1.2",
                      conn: "3/3",
                    },
                    {
                      name: "Property Name",
                      value: "Property Value",
                      star: "1.2",
                      conn: "3/3",
                    },
                    {
                      name: "Property Name",
                      value: "Property Value",
                      star: "1.2",
                      conn: "3/3",
                    },
                    {
                      name: "Property Name",
                      value: "Property Value",
                      star: "1.2",
                      conn: "3/3",
                    },
                    {
                      name: "Property Name",
                      value: "Property Value",
                      star: "1.2",
                      conn: "3/3",
                    },
                    {
                      name: "Property Name",
                      value: "Property Value",
                      star: "1.2",
                      conn: "3/3",
                    },
                    {
                      name: "Property Name",
                      value: "Property Value",
                      star: "1.2",
                      conn: "3/3",
                    },
                  ].map((item) => (
                    <PropertyCard
                      data={{
                        name: item.name,
                        value: item.value,
                        star: item.star,
                        conn: item.conn,
                      }}
                    />
                  ))
                )}
              </div>
            ) : (
              <button>Generate Rarity Report</button>
            )}
          </div>
        </section>
      ) : (
        <section className="rc-nft-container">
          <div className="rc-nft-container-preview">
            <div className="rc-nft-container-preview-image">
              <img
                src={`/not_found_nft.png`}
                className="h-24 w-24 rounded-lg"
              />
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
      )}
      {Loading && (
        <div className="rc-container rc-nft-loading">
          <p>Scanning through NFTs...</p>
        </div>
      )}
    </main>
  );
}

export default nftDetail;
