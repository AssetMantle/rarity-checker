import { assetmantle } from "@assetmantle/mantlejs";
import base64url from "base64url";
import { Base64 } from "js-base64";
import React, { useEffect, useState } from "react";
import { fetchNftData, fetchNftData2 } from "./api/data";
import { BsFillBarChartFill } from "react-icons/bs";

function rarity() {
  const [nftData, setNftData] = useState([]);
  const [ascendingOrder, setAscendingOrder] = useState(true);
  const [searchId, setSearchId] = useState("");
  const sortedData = [...nftData].sort((a, b) =>
    ascendingOrder ? a?.rank - b?.rank : b?.rank - a?.rank
  );

  async function requestData(
    mantleQueryClient,
    page_number,
    lastAssetIDUint8Array
  ) {
    const queryRequest =
      assetmantle.modules.assets.queries.assets.QueryRequest.fromPartial({
        key: assetmantle.modules.assets.key.Key.fromPartial({
          assetID: assetmantle.schema.ids.base.AssetID.fromPartial({
            hashID: assetmantle.schema.ids.base.HashID.fromPartial({
              iDBytes: new Uint8Array(),
            }),
          }),
        }),
        limit: 10,
        //   countTotal: true,
        //   key: new Uint8Array(),
        key: lastAssetIDUint8Array
          ? { assetID: { hashID: { iDBytes: lastAssetIDUint8Array } } }
          : { assetID: { hashID: { iDBytes: new Uint8Array() } } },
      });

    const response =
      await mantleQueryClient.assetmantle.modules.assets.queries.assets.handle(
        queryRequest
      );

    return response;
  }

  function timer(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function fetchNftData() {
    let nftList = [];
    let response;
    const mantleQueryClient =
      await assetmantle.ClientFactory.createRPCQueryClient({
        rpcEndpoint: "http://127.0.0.1:26657",
      });

    const hashIdUint8Array = new Uint8Array(
      base64url.toBuffer("CTo0LrPFR/5hdCenpBdVo9dN3jsaX2xDvJOLEdJYvQ=")
    );

    //   console.log(hashIdUint8Array);

    let page_number = 1;
    let lastAssetIDUint8Array;
    let lastAssetIDBase64;
    while (page_number <= 5) {
      await timer(1000);
      if (page_number === 1) {
        response = await requestData(mantleQueryClient, page_number);
      } else {
        response = await requestData(
          mantleQueryClient,
          page_number,
          lastAssetIDUint8Array
        );
      }
      lastAssetIDUint8Array =
        response?.list[response?.list?.length - 1]?.key?.assetID?.hashID
          ?.iDBytes;
      // lastAssetIDBase64 = Base64.fromUint8Array(
      //   lastAssetIDUint8Array?.key?.assetID?.hashID?.iDBytes
      // );
      response?.list.map((item) => nftList.push(item));
      let finalList = filterProperties(nftList);
      console.log(finalList);
      setNftData(finalList);
      page_number++;
    }

    // setRawData(JSON.stringify(response));

    // let finalList = filterProperties(nftList);

    // return finalList;
  }

  const filterProperties = (list) => {
    const nftList = [];
    const rarity = {};
    let nftCount = 0;

    // check list is non-empty
    if (list && list?.length > 0) {
      // loop through all nfts
      for (const nft of list) {
        // creating local object to hold NftId and properties of single NFT
        // add custom Nft ID for each asset
        let nftRarityObject = { NftId: "00" + nftCount };
        let propertyList = [];

        let assetIDBase64 = Base64.fromUint8Array(
          nft?.key?.assetID?.hashID?.iDBytes
        );

        // adding asset Id to local object
        nftRarityObject.assetId = assetIDBase64;

        let classificationIDBase64 = Base64.fromUint8Array(
          nft?.mappable?.asset?.classificationID?.hashID?.iDBytes
        );

        // adding classification Id to local object
        nftRarityObject.classificationId = classificationIDBase64;

        // loop through immutables attributes
        for (const immutableProperty of nft?.mappable?.asset?.immutables
          ?.propertyList?.anyProperties) {
          // check for mesa property
          if (immutableProperty?.mesaProperty) {
            let localImmutableProperty = {};

            // check if property available in rarity object
            if (!rarity[immutableProperty?.mesaProperty?.iD?.keyID?.iDString]) {
              rarity[immutableProperty?.mesaProperty?.iD?.keyID?.iDString] = {};
            }

            // convert value from uint8array to base64
            const cleanData = Base64.fromUint8Array(
              immutableProperty?.mesaProperty?.dataID?.hashID?.iDBytes
            );

            // add property value to rarity object if it doesn't exist and set count to 0
            if (
              !rarity[immutableProperty?.mesaProperty?.iD?.keyID?.iDString][
                cleanData
              ]
            ) {
              rarity[immutableProperty?.mesaProperty?.iD?.keyID?.iDString][
                cleanData
              ] = {
                count: 0,
              };
            }

            // increment count of property type in rarity object
            rarity[immutableProperty?.mesaProperty?.iD?.keyID?.iDString][
              cleanData
            ].count++;

            // calculate rarity score
            let score =
              1 /
              (rarity[immutableProperty?.mesaProperty?.iD?.keyID?.iDString][
                cleanData
              ].count /
                list?.length);

            // add rarity score to rarity object for each property type
            rarity[immutableProperty?.mesaProperty?.iD?.keyID?.iDString][
              cleanData
            ].rarityScore = score;

            // add property title to local variable localImmutableProperty
            localImmutableProperty.propertyName =
              immutableProperty?.mesaProperty?.iD?.keyID?.iDString;

            // add property value to local variable localImmutableProperty
            localImmutableProperty.propertyValue = cleanData;

            // add property rarity score to local variable localImmutableProperty
            // localImmutableProperty.rarityScore = score;

            // add property type to local variable localMutableProperty
            localImmutableProperty.propertyType = "mesa";

            // push single local Immutable Property to property list array
            propertyList.push(localImmutableProperty);
          }

          // check for meta property
          if (immutableProperty?.metaProperty) {
            let localImmutableProperty = {};

            // check if property available in rarity object
            if (!rarity[immutableProperty?.metaProperty?.iD?.keyID?.iDString]) {
              rarity[immutableProperty?.metaProperty?.iD?.keyID?.iDString] = {};
            }

            // filter value from data
            // filter key:value which is not undefined inside data
            // **return obj if you want data type
            const cleanData = Object.entries(
              immutableProperty?.metaProperty?.data
            )
              .filter(([key, value]) => value !== undefined)
              .reduce((obj, [key, value]) => {
                obj[key] = value;
                return value;
              }, {});

            // add property value to rarity object if it doesn't exist and set count to 0
            if (
              !rarity[immutableProperty?.metaProperty?.iD?.keyID?.iDString][
                cleanData?.value
              ]
            ) {
              rarity[immutableProperty?.metaProperty?.iD?.keyID?.iDString][
                cleanData?.value
              ] = {
                count: 0,
              };
            }

            // increment count of property type
            rarity[immutableProperty?.metaProperty?.iD?.keyID?.iDString][
              cleanData?.value
            ].count++;

            // calculate rarity score
            let score =
              1 /
              (rarity[immutableProperty?.metaProperty?.iD?.keyID?.iDString][
                cleanData?.value
              ].count /
                list?.length);

            // add rarity score to rarity object for each property type
            rarity[immutableProperty?.metaProperty?.iD?.keyID?.iDString][
              cleanData?.value
            ].rarityScore = score;

            // add property title to local variable localImmutableProperty
            localImmutableProperty.propertyName =
              immutableProperty?.metaProperty?.iD?.keyID?.iDString;

            // add property value to local variable localImmutableProperty
            localImmutableProperty.propertyValue = cleanData?.value;

            // add property rarity score to local variable localImmutableProperty
            // localImmutableProperty.rarityScore = score;

            // add property type to local variable localMutableProperty
            localImmutableProperty.propertyType = "meta";

            // push single local Immutable Property to property list array
            propertyList.push(localImmutableProperty);
          }
        }

        // loop through mutables attributes
        for (const mutableProperty of nft?.mappable?.asset?.mutables
          ?.propertyList?.anyProperties) {
          // check for mesa property
          if (mutableProperty?.mesaProperty) {
            let localMutableProperty = {};

            // check if property available in rarity object
            if (!rarity[mutableProperty?.mesaProperty?.iD?.keyID?.iDString]) {
              rarity[mutableProperty?.mesaProperty?.iD?.keyID?.iDString] = {};
            }

            // convert value from uint8array to base64
            const cleanData = Base64.fromUint8Array(
              mutableProperty?.mesaProperty?.dataID?.hashID?.iDBytes
            );

            // add property value to rarity object if it doesn't exist and set count to 0
            if (
              !rarity[mutableProperty?.mesaProperty?.iD?.keyID?.iDString][
                cleanData
              ]
            ) {
              rarity[mutableProperty?.mesaProperty?.iD?.keyID?.iDString][
                cleanData
              ] = {
                count: 0,
              };
            }

            // increment count of property type
            rarity[mutableProperty?.mesaProperty?.iD?.keyID?.iDString][
              cleanData
            ].count++;

            // calculate rarity score
            let score =
              1 /
              (rarity[mutableProperty?.mesaProperty?.iD?.keyID?.iDString][
                cleanData
              ].count /
                list?.length);

            // add rarity score to rarity object for each property type
            rarity[mutableProperty?.mesaProperty?.iD?.keyID?.iDString][
              cleanData
            ].rarityScore = score;

            // add property title to local variable localMutableProperty
            localMutableProperty.propertyName =
              mutableProperty?.mesaProperty?.iD?.keyID?.iDString;

            // add property value to local variable localMutableProperty
            localMutableProperty.propertyValue = cleanData;

            // add property type to local variable localMutableProperty
            localMutableProperty.propertyType = "mesa";

            // add property rarity score to local variable localMutableProperty
            // localMutableProperty.rarityScore = score;

            // push single local Immutable Property to property list array
            propertyList.push(localMutableProperty);
          }

          // check for meta property
          if (mutableProperty?.metaProperty) {
            let localMutableProperty = {};

            // check if property available in rarity object
            if (!rarity[mutableProperty?.metaProperty?.iD?.keyID?.iDString]) {
              rarity[mutableProperty?.metaProperty?.iD?.keyID?.iDString] = {};
            }

            // filter value from data
            // filter key:value which is not undefined inside data
            // **return obj if you want data type
            const cleanData = Object.entries(
              mutableProperty?.metaProperty?.data
            )
              .filter(([key, value]) => value !== undefined)
              .reduce((obj, [key, value]) => {
                obj[key] = value;
                return value;
              }, {});

            // add property value to rarity object if it doesn't exist and set count to 0
            if (
              !rarity[mutableProperty?.metaProperty?.iD?.keyID?.iDString][
                cleanData?.value
              ]
            ) {
              rarity[mutableProperty?.metaProperty?.iD?.keyID?.iDString][
                cleanData?.value
              ] = {
                count: 0,
              };
            }

            // increment count of property type
            rarity[mutableProperty?.metaProperty?.iD?.keyID?.iDString][
              cleanData?.value
            ].count++;

            // calculate rarity score
            let score =
              1 /
              (rarity[mutableProperty?.metaProperty?.iD?.keyID?.iDString][
                cleanData?.value
              ].count /
                list?.length);

            // add rarity score to rarity object for each property type
            rarity[mutableProperty?.metaProperty?.iD?.keyID?.iDString][
              cleanData?.value
            ].rarityScore = score;

            // add property title to local variable localMutableProperty
            localMutableProperty.propertyName =
              mutableProperty?.metaProperty?.iD?.keyID?.iDString;

            // add property value to local variable localMutableProperty
            localMutableProperty.propertyValue = cleanData?.value;

            // add property rarity score to local variable localMutableProperty
            // localMutableProperty.rarityScore = score;

            // add property type to local variable localMutableProperty
            localMutableProperty.propertyType = "meta";

            // push single local Immutable Property to property list array
            propertyList.push(localMutableProperty);
          }
        }

        // adding rarity object to local object
        // nftRarityObject.properties = rarity;
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
  };

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

  useEffect(() => {
    fetchNftData();
  }, []);

  return (
    <div className="min-h-[100%] py-12 flex items-center justify-center bg-[#111111]">
      <div className="w-full px-4 flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 p-2 bg-transparent border border-white/20 rounded-lg placeholder-white/20 text-sm text-white focus:border-[#ffc640] outline-none focus:text-white"
            placeholder="Enter Asset or Classification ID to search"
          />
        </div>
        <div className="flex flex-wrap gap-y-4 gap-x-4">
          {sortedData &&
            sortedData.map((nft, index) => (
              <div
                key={index}
                className={`w-[calc(25%-.8rem)] text-white bg-[#030301] border border-white/20 rounded-xl flex flex-col gap-2 ${
                  nft?.assetId.startsWith(searchId) ||
                  nft?.classificationId.startsWith(searchId)
                    ? "block"
                    : "hidden"
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
  );
}

export default rarity;
