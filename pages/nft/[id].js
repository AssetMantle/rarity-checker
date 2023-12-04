"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PropertyCard from "../../Components/PropertyCard";
import Link from "next/link";
import { AiFillSignal } from "react-icons/ai";

// for fetch
import { assetmantle } from "@assetmantle/mantlejs";
import { Base64 } from "js-base64";
import { dummyData, rpcEndpointLocalNode } from "../../config";

function nftDetail(props) {
  const [NftID, setNftID] = useState();
  const [SearchNftID, setSearchNftID] = useState();
  const [nftData, setNftData] = useState([]);
  const [collectionData, setCollectionData] = useState({});
  // const [NftPropertyData, setNftPropertyData] = useState([]);
  const [NftPropertyRaw, setNftPropertyRaw] = useState([]);

  const NftPropertyData = [...NftPropertyRaw].filter(
    (el) => el.assetId === NftID
  )[0];

  const [Loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setNftID(router.query.id);
    setSearchNftID(router.query.id);
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
        });
    }
  };
  useEffect(() => {
    // getNFTData();
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

  async function searchForAssetId() {
    if (NftID) {
      const mantleQueryClient =
        await assetmantle.ClientFactory.createRPCQueryClient({
          rpcEndpoint: rpcEndpointLocalNode,
        });

      const queryRequest =
        assetmantle.modules.assets.queries.assets.QueryRequest.fromPartial({
          key: assetmantle.modules.assets.key.Key.fromPartial({
            assetID: assetmantle.schema.ids.base.AssetID.fromPartial({
              hashID: assetmantle.schema.ids.base.HashID.fromPartial({
                iDBytes: new Uint8Array(),
              }),
            }),
          }),
          limit: 1,
          key: { assetID: { hashID: { iDBytes: NftID } } },
        });

      const response =
        await mantleQueryClient.assetmantle.modules.assets.queries.assets.handle(
          queryRequest
        );

      console.log("query response: ", response);

      let filteredNft = simplifyRawNftData(response?.list);
      filteredNft.searchedId = 1;

      let filteredRecords = await fetchAllNfts(
        filteredNft?.assetId,
        filteredNft?.classificationId
      );

      filteredRecords.push(filteredNft);

      let finalList = calculateRarity(filteredRecords);
      setNftPropertyRaw(finalList);
    } else {
      console.log("Pls! provide assetId...");
    }
  }

  function simplifyRawNftData(rawData) {
    // creating local object to hold assetId and properties of single NFT
    let filteredNft = {};

    // check list is non-empty
    if (rawData && rawData?.length > 0) {
      // loop through array
      for (const nft of rawData) {
        let assetIDBase64 = Base64.fromUint8Array(
          nft?.key?.assetID?.hashID?.iDBytes
        );

        // adding asset Id to local object
        filteredNft.assetId = assetIDBase64;

        let classificationIDBase64 = Base64.fromUint8Array(
          nft?.mappable?.asset?.classificationID?.hashID?.iDBytes
        );

        // adding classification Id to local object
        filteredNft.classificationId = classificationIDBase64;

        // filter attributes
        filteredNft.properties = simplifyRawNftProperty(nft);
      }
    }
    return filteredNft;
  }

  function simplifyRawNftProperty(nft) {
    let propertyList = [];
    for (const propertyType of [
      nft?.mappable?.asset?.immutables?.propertyList?.anyProperties,
      nft?.mappable?.asset?.mutables?.propertyList?.anyProperties,
    ]) {
      for (const property of propertyType) {
        // check for mesa property
        if (property?.mesaProperty) {
          let localPropertyObject = {};

          // convert value from uint8array to base64
          const cleanData = Base64.fromUint8Array(
            property?.mesaProperty?.dataID?.hashID?.iDBytes
          );

          // add property title to local variable localPropertyObject
          localPropertyObject.propertyName =
            property?.mesaProperty?.iD?.keyID?.iDString;

          // add property value to local variable localPropertyObject
          localPropertyObject.propertyValue = cleanData;

          // add property type to local variable localMutableProperty
          localPropertyObject.propertyType = "mesa";

          // push single local Immutable Property to property list array
          propertyList.push(localPropertyObject);
        }

        // check for meta property
        if (property?.metaProperty) {
          let localPropertyObject = {};

          // filter value from data
          // filter key:value which is not undefined inside data
          // **return obj if you want data type
          const cleanData = Object.entries(property?.metaProperty?.data)
            .filter(([key, value]) => value !== undefined)
            .reduce((obj, [key, value]) => {
              obj[key] = value;
              return value;
            }, {});

          // add property title to local variable localPropertyObject
          localPropertyObject.propertyName =
            property?.metaProperty?.iD?.keyID?.iDString;

          // add property value to local variable localPropertyObject
          localPropertyObject.propertyValue = cleanData?.value;

          // add property type to local variable localPropertyObject
          localPropertyObject.propertyType = "meta";

          // push single local Immutable Property to property list array
          propertyList.push(localPropertyObject);
        }
      }
    }
    return propertyList;
  }

  async function fetchAllNfts(assetId, classificationId) {
    const mantleQueryClient =
      await assetmantle.ClientFactory.createRPCQueryClient({
        rpcEndpoint: rpcEndpointLocalNode,
      });

    const queryRequest =
      assetmantle.modules.assets.queries.assets.QueryRequest.fromPartial({
        key: assetmantle.modules.assets.key.Key.fromPartial({
          assetID: assetmantle.schema.ids.base.AssetID.fromPartial({
            hashID: assetmantle.schema.ids.base.HashID.fromPartial({
              iDBytes: new Uint8Array(),
            }),
          }),
        }),
        limit: 5,
      });

    const response =
      await mantleQueryClient.assetmantle.modules.assets.queries.assets.handle(
        queryRequest
      );

    console.log("classification response: ", response);

    const dummyResponse = { ...dummyData };
    // const nftList = filterDummyList(dummyResponse?.list);
    const nftList = response?.list;

    // filterSameClassificationId(response?.list, classificationId);
    let filteredRecords = filterSameClassificationId(
      nftList,
      assetId,
      classificationId
    );

    return filteredRecords;
  }

  function filterSameClassificationId(nftList, assetId, classificationId) {
    let filteredRecords = [];
    for (let nft of nftList) {
      let classificationIDBase64 = Base64.fromUint8Array(
        nft?.mappable?.asset?.classificationID?.hashID?.iDBytes
      );
      let assetIDBase64 = Base64.fromUint8Array(
        nft?.key?.assetID?.hashID?.iDBytes
      );

      if (
        classificationId === classificationIDBase64 &&
        assetId !== assetIDBase64
      ) {
        filteredRecords.push(simplifyRawNftData([nft]));
      }
    }
    return filteredRecords;
  }

  function calculateRarity(filteredRecords) {
    const nftList = [];
    const rarity = {};
    let nftCount = 0;

    // check list is non-empty
    if (filteredRecords && filteredRecords?.length > 0) {
      // loop through all nfts
      for (const nft of filteredRecords) {
        let nftRarityObject = { NftId: "00" + nftCount };
        let propertyList = [];

        // adding asset Id to local object
        nftRarityObject.assetId = nft?.assetId;

        // adding classification Id to local object
        nftRarityObject.classificationId = nft?.classificationId;

        // adding flag for searched assetId to local object
        if (nft?.searchedId) {
          nftRarityObject.searchedId = nft?.searchedId;
        }

        // loop through all properties
        for (const property of nft?.properties) {
          let localProperty = {};

          // check if property available in rarity object
          if (!rarity[property?.propertyName]) {
            rarity[property?.propertyName] = {};
          }

          // add property value to rarity object if it doesn't exist and set count to 0
          if (!rarity[property?.propertyName][property?.propertyValue]) {
            rarity[property?.propertyName][property?.propertyValue] = {
              count: 0,
            };
          }

          // increment count of property type in rarity object
          rarity[property?.propertyName][property?.propertyValue].count++;

          // calculate rarity score
          let score =
            1 /
            (rarity[property?.propertyName][property?.propertyValue].count /
              filteredRecords?.length);

          // add rarity score to rarity object for each property type
          rarity[property?.propertyName][property?.propertyValue].rarityScore =
            score;

          // add property title to local variable localProperty
          localProperty.propertyName = property?.propertyName;

          // add property value to local variable localProperty
          localProperty.propertyValue = property?.propertyValue;

          // add property type to local variable localProperty
          localProperty.propertyType = property?.propertyType;

          // push single local Property to property list array
          propertyList.push(localProperty);
        }

        // adding rarity object to local object
        nftRarityObject.properties = propertyList;

        // adding complete local object to nftList array
        nftList.push(nftRarityObject);
        nftCount++;
      }
      // create a total rarity score for each nft by adding up all the rarity scores for each property type
      calculateTotalScore(nftList, rarity);
    }
    // sort and rank nfts by total rarity score
    sortNft(nftList);

    return nftList;
  }

  const calculateTotalScore = (nftList, rarity) => {
    nftList.map((nft) => {
      let totalScore = 0;
      for (const property of nft.properties) {
        property.rarityScore =
          rarity[property.propertyName][property.propertyValue].rarityScore;
        totalScore += parseFloat(property.rarityScore);
      }
      nft.totalRarityScore = +parseFloat(totalScore).toFixed(2);
    });
  };

  const sortNft = (nftList) => {
    nftList
      .sort((a, b) => b.totalRarityScore - a.totalRarityScore)
      .map((nft, index) => {
        nft.rank = index + 1;
        return nft;
      })
      .sort((a, b) => a.NftId - b.NftId);
    // return sortAndRank;
  };

  console.log(props.data);

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
        <Link
          href={`/nft/${SearchNftID}`}
          //onClick={() => false}
          className=""
        >
          Check NFT Rarity
        </Link>
      </section>
      <i className="rc-divider"></i>

      {nftData ? (
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
                  To know individual property rarity scores, click below to
                  generate rarity report{" "}
                </p>
                <button onClick={searchForAssetId}>
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
