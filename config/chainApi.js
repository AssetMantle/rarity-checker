import { assetmantle } from "@assetmantle/mantlejs";
import { Base64 } from "js-base64";
import { rpcEndpointLocalNode } from "./chain";
import base64url from "base64url";

("base64url");
// import base64url from "base64url";

export const getCollectionData = async () => {
  const res = await fetch("../data/ethCollectionData.json");
  const posts = await res.json();
  return posts;
};

export const validateAssetId = (assetId) => {
  if (!assetId) return false;
  var base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  console.log("base64 decoded: ", base64regex.test(assetId));
  return base64regex.test(assetId);
};

export const queryAssetId = async (assetId) => {
  const hashIdUint8Array = new Uint8Array(base64url.toBuffer(assetId));
  const mantleQueryClient =
    await assetmantle.ClientFactory.createRPCQueryClient({
      rpcEndpoint: rpcEndpointLocalNode,
    });

  const queryRequest =
    assetmantle.modules.assets.queries.asset.QueryRequest.fromPartial({
      key: assetmantle.modules.assets.key.Key.fromPartial({
        assetID: assetmantle.schema.ids.base.AssetID.fromPartial({
          hashID: assetmantle.schema.ids.base.HashID.fromPartial({
            iDBytes: hashIdUint8Array,
          }),
        }),
      }),
    });

  const response =
    await mantleQueryClient.assetmantle.modules.assets.queries.asset.handle(
      queryRequest
    );

  console.log("queryAssetId response: ", response);

  const classificationIDBase64 = Base64.fromUint8Array(
    response?.record?.mappable?.asset?.classificationID?.hashID?.iDBytes
  );

  const assetIDBase64 = Base64.fromUint8Array(
    response?.record?.key?.assetID?.hashID?.iDBytes
  );
  const res = { ...response, assetIDBase64, classificationIDBase64 };

  console.log(res);
  return res;
};

export async function searchForAssetId(NftID) {
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
    return finalList;
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
