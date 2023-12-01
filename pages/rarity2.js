import { assetmantle } from "@assetmantle/mantlejs";
import { Base64 } from "js-base64";
import React, { useState } from "react";
import { BsFillBarChartFill } from "react-icons/bs";
import { dummyData, filterDummyList, rpcEndpointLocalNode } from "../config";

function rarity2() {
  const [nftData, setNftData] = useState([]);
  const [ascendingOrder, setAscendingOrder] = useState(true);
  const [searchAssetId, setSearchAssetId] = useState("");
  const sortedData = [...nftData].sort((a, b) =>
    ascendingOrder ? a?.rank - b?.rank : b?.rank - a?.rank
  );

  async function searchForAssetId() {
    if (searchAssetId) {
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
          key: { assetID: { hashID: { iDBytes: searchAssetId } } },
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
      setNftData(finalList);
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

  function timer(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  return (
    <>
      <main
        className="rc-home"
        style={{ backgroundImage: "url(/bg.png)" }}
      ></main>
      <div className="min-h-[100%] py-12 flex items-center justify-center bg-[#111111]">
        <div className="w-full px-4 flex flex-col gap-4">
          <div className="flex gap-3 items-center justify-center">
            <input
              type="text"
              value={searchAssetId}
              onChange={(e) => setSearchAssetId(e.target.value)}
              className="w-1/3 p-2 bg-transparent border border-white/20 rounded-lg placeholder-white/20 text-sm text-white focus:border-[#ffc640] outline-none focus:text-white"
              placeholder="Enter Asset ID"
            />
            <button
              onClick={searchForAssetId}
              className="bg-[#ffc640] py-2 px-4 rounded-lg text-sm"
            >
              Search
            </button>
          </div>
          <div className="flex flex-wrap gap-y-4 gap-x-4">
            {sortedData &&
              sortedData.map((nft, index) => (
                <div
                  key={index}
                  className={`w-[calc(25%-.8rem)] text-white bg-[#030301] border  ${
                    nft?.searchedId == 1
                      ? "border-[#ffc640]"
                      : "border-white/20"
                  } rounded-xl flex flex-col gap-2 ${
                    nft?.assetId.startsWith(searchAssetId) ? "block" : "block"
                  }`}
                >
                  <div className="py-2 px-4">
                    <div className="flex justify-between items-center">
                      <div>{nft.NftId}</div>
                      <div className="text-[#ffc640] text-sm flex gap-1 items-center">
                        <BsFillBarChartFill size={14} />
                        {nft?.rank}
                      </div>
                    </div>

                    <div className="text-sm">
                      Rarity Score: {nft?.totalRarityScore}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-white/20 py-4 px-4">
                    {nft?.properties &&
                      nft?.properties.map((property, i) => (
                        <div
                          key={i}
                          className="border border-white/20 rounded-md text-sm"
                        >
                          <div className="py-2 px-3">
                            {property?.propertyName}
                            <div className="text-white/50">
                              {property?.propertyType === "mesa"
                                ? "***"
                                : property?.propertyValue}
                            </div>
                          </div>
                          <div className="text-white/30 border-t border-white/20  text-center flex justify-evenly items-center gap-2">
                            <div className="border-r border-white/20 py-1 px-3">
                              {property?.rarityScore.toFixed(2)}
                            </div>
                            <div className="text-sm py-1 px-3">
                              {Math.round(
                                (1 / property?.rarityScore) * sortedData?.length
                              )}
                              /{sortedData?.length}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default rarity2;
