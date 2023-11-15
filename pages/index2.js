import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { assetmantle } from "@assetmantle/mantlejs";
import Long from "long";
import { useEffect, useState } from "react";
import base64url from "base64url";

export default function HomePrevious() {
  // const fetchData = async () => {
  //   // const mantleRestClient = await assetmantle?.ClientFactory?.
  //   const mantleClient = await assetmantle?.ClientFactory?.createRPCQueryClient(
  //     {
  //       rpcEndpoint: "http://localhost:26657",
  //       // rpcEndpoint: "https://rpc.testnet.assetmantle.one/",
  //     }
  //   );
  //   console.log(mantleClient);
  //   const pageRequest = {
  //     // offset: new Long(0, 0, true),
  //     limit: new Long(2, 0, true),
  //     // reverse: false,
  //     // countTotal: true,
  //     key: new Uint8Array(),
  //   };

  //   const { list } =
  //     await mantleClient.assetmantle.modules.assets.queries.assets.handle(
  //       pageRequest
  //     );
  //   console.log(list);
  // };
  // // fetchData();

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

        // loop through immutables attributes
        for (const immutableProperty of nft?.mappable?.asset?.immutables
          ?.propertyList?.anyProperties) {
          // check for mesa property
          if (immutableProperty?.mesaProperty) {
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
            let score = (
              1 /
              (rarity[immutableProperty?.metaProperty?.iD?.keyID?.iDString][
                cleanData?.value
              ].count /
                11)
            ).toFixed(2);

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

            // push single local Immutable Property to property list array
            propertyList.push(localImmutableProperty);
          }
        }

        // loop through mutables attributes
        for (const mutableProperty of nft?.mappable?.asset?.mutables
          ?.propertyList?.anyProperties) {
          // check for mesa property
          if (mutableProperty?.mesaProperty) {
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
            let score = (
              1 /
              (rarity[mutableProperty?.metaProperty?.iD?.keyID?.iDString][
                cleanData?.value
              ].count /
                11)
            ).toFixed(2);

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
    console.log("Final list");
    console.log(nftList);
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

  async function fetchNftData() {
    const mantleQueryClient =
      await assetmantle.ClientFactory.createRPCQueryClient({
        rpcEndpoint: "https://rpc.testnet.assetmantle.one/",
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
        limit: 11,
      });

    const response =
      await mantleQueryClient.assetmantle.modules.assets.queries.assets.handle(
        queryRequest
      );
    // setRawData(JSON.stringify(response));

    const dummyData = {
      list: [
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 1,
                  1: 62,
                  2: 61,
                  3: 132,
                  4: 72,
                  5: 198,
                  6: 131,
                  7: 193,
                  8: 123,
                  9: 48,
                  10: 215,
                  11: 140,
                  12: 174,
                  13: 39,
                  14: 89,
                  15: 13,
                  16: 209,
                  17: 125,
                  18: 206,
                  19: 250,
                  20: 251,
                  21: 27,
                  22: 158,
                  23: 76,
                  24: 45,
                  25: 90,
                  26: 241,
                  27: 216,
                  28: 45,
                  29: 3,
                  30: 183,
                  31: 222,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 250,
                    1: 26,
                    2: 200,
                    3: 185,
                    4: 62,
                    5: 75,
                    6: 231,
                    7: 135,
                    8: 71,
                    9: 230,
                    10: 116,
                    11: 238,
                    12: 62,
                    13: 232,
                    14: 238,
                    15: 126,
                    16: 240,
                    17: 60,
                    18: 31,
                    19: 189,
                    20: 139,
                    21: 110,
                    22: 87,
                    23: 190,
                    24: 229,
                    25: 52,
                    26: 142,
                    27: 103,
                    28: 83,
                    29: 51,
                    30: 179,
                    31: 94,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "3868952",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "5190334",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 60,
                              1: 92,
                              2: 2,
                              3: 249,
                              4: 160,
                              5: 94,
                              6: 191,
                              7: 1,
                              8: 134,
                              9: 171,
                              10: 80,
                              11: 142,
                              12: 177,
                              13: 102,
                              14: 18,
                              15: 250,
                              16: 170,
                              17: 1,
                              18: 214,
                              19: 4,
                              20: 66,
                              21: 45,
                              22: 60,
                              23: 175,
                              24: 143,
                              25: 132,
                              26: 204,
                              27: 217,
                              28: 111,
                              29: 51,
                              30: 16,
                              31: 162,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "0276925",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "4521601",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "100",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 1,
                  1: 72,
                  2: 243,
                  3: 239,
                  4: 34,
                  5: 61,
                  6: 214,
                  7: 160,
                  8: 159,
                  9: 224,
                  10: 6,
                  11: 136,
                  12: 68,
                  13: 115,
                  14: 31,
                  15: 225,
                  16: 98,
                  17: 167,
                  18: 184,
                  19: 42,
                  20: 31,
                  21: 145,
                  22: 239,
                  23: 170,
                  24: 247,
                  25: 109,
                  26: 233,
                  27: 189,
                  28: 143,
                  29: 70,
                  30: 213,
                  31: 24,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 113,
                    1: 58,
                    2: 17,
                    3: 222,
                    4: 13,
                    5: 110,
                    6: 86,
                    7: 24,
                    8: 4,
                    9: 27,
                    10: 109,
                    11: 198,
                    12: 212,
                    13: 14,
                    14: 126,
                    15: 58,
                    16: 33,
                    17: 10,
                    18: 220,
                    19: 181,
                    20: 68,
                    21: 92,
                    22: 20,
                    23: 159,
                    24: 67,
                    25: 98,
                    26: 152,
                    27: 35,
                    28: 200,
                    29: 254,
                    30: 20,
                    31: 185,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "3125262",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 60,
                              1: 92,
                              2: 2,
                              3: 249,
                              4: 160,
                              5: 94,
                              6: 191,
                              7: 1,
                              8: 134,
                              9: 171,
                              10: 80,
                              11: 142,
                              12: 177,
                              13: 102,
                              14: 18,
                              15: 250,
                              16: 170,
                              17: 1,
                              18: 214,
                              19: 4,
                              20: 66,
                              21: 45,
                              22: 60,
                              23: 175,
                              24: 143,
                              25: 132,
                              26: 204,
                              27: 217,
                              28: 111,
                              29: 51,
                              30: 16,
                              31: 162,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "5368556",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "1829121",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "8567426",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "100",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 1,
                  1: 126,
                  2: 220,
                  3: 249,
                  4: 62,
                  5: 195,
                  6: 118,
                  7: 113,
                  8: 162,
                  9: 176,
                  10: 80,
                  11: 100,
                  12: 175,
                  13: 214,
                  14: 44,
                  15: 192,
                  16: 28,
                  17: 7,
                  18: 218,
                  19: 7,
                  20: 62,
                  21: 20,
                  22: 3,
                  23: 222,
                  24: 229,
                  25: 124,
                  26: 120,
                  27: 143,
                  28: 215,
                  29: 41,
                  30: 60,
                  31: 5,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 110,
                    1: 64,
                    2: 35,
                    3: 64,
                    4: 24,
                    5: 24,
                    6: 193,
                    7: 50,
                    8: 226,
                    9: 39,
                    10: 222,
                    11: 86,
                    12: 80,
                    13: 187,
                    14: 180,
                    15: 70,
                    16: 152,
                    17: 56,
                    18: 110,
                    19: 6,
                    20: 102,
                    21: 23,
                    22: 65,
                    23: 68,
                    24: 230,
                    25: 160,
                    26: 92,
                    27: 234,
                    28: 157,
                    29: 123,
                    30: 232,
                    31: 251,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "4738282",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "5584457",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 60,
                              1: 92,
                              2: 2,
                              3: 249,
                              4: 160,
                              5: 94,
                              6: 191,
                              7: 1,
                              8: 134,
                              9: 171,
                              10: 80,
                              11: 142,
                              12: 177,
                              13: 102,
                              14: 18,
                              15: 250,
                              16: 170,
                              17: 1,
                              18: 214,
                              19: 4,
                              20: 66,
                              21: 45,
                              22: 60,
                              23: 175,
                              24: 143,
                              25: 132,
                              26: 204,
                              27: 217,
                              28: 111,
                              29: 51,
                              30: 16,
                              31: 162,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "7038824",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "8232697",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "100",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 1,
                  1: 165,
                  2: 127,
                  3: 252,
                  4: 59,
                  5: 186,
                  6: 55,
                  7: 199,
                  8: 62,
                  9: 142,
                  10: 180,
                  11: 136,
                  12: 42,
                  13: 201,
                  14: 180,
                  15: 16,
                  16: 104,
                  17: 181,
                  18: 110,
                  19: 137,
                  20: 119,
                  21: 234,
                  22: 91,
                  23: 2,
                  24: 140,
                  25: 87,
                  26: 116,
                  27: 160,
                  28: 55,
                  29: 40,
                  30: 190,
                  31: 213,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 244,
                    1: 178,
                    2: 231,
                    3: 87,
                    4: 162,
                    5: 177,
                    6: 85,
                    7: 11,
                    8: 98,
                    9: 157,
                    10: 105,
                    11: 100,
                    12: 162,
                    13: 91,
                    14: 175,
                    15: 12,
                    16: 192,
                    17: 233,
                    18: 98,
                    19: 109,
                    20: 123,
                    21: 177,
                    22: 42,
                    23: 113,
                    24: 145,
                    25: 36,
                    26: 173,
                    27: 193,
                    28: 248,
                    29: 85,
                    30: 81,
                    31: 110,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "2960392",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "4038250",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 60,
                              1: 92,
                              2: 2,
                              3: 249,
                              4: 160,
                              5: 94,
                              6: 191,
                              7: 1,
                              8: 134,
                              9: 171,
                              10: 80,
                              11: 142,
                              12: 177,
                              13: 102,
                              14: 18,
                              15: 250,
                              16: 170,
                              17: 1,
                              18: 214,
                              19: 4,
                              20: 66,
                              21: 45,
                              22: 60,
                              23: 175,
                              24: 143,
                              25: 132,
                              26: 204,
                              27: 217,
                              28: 111,
                              29: 51,
                              30: 16,
                              31: 162,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "0132198",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "4878356",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "100",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 1,
                  1: 228,
                  2: 23,
                  3: 201,
                  4: 178,
                  5: 144,
                  6: 103,
                  7: 166,
                  8: 190,
                  9: 210,
                  10: 159,
                  11: 54,
                  12: 196,
                  13: 159,
                  14: 83,
                  15: 87,
                  16: 97,
                  17: 139,
                  18: 62,
                  19: 76,
                  20: 175,
                  21: 38,
                  22: 166,
                  23: 213,
                  24: 240,
                  25: 78,
                  26: 35,
                  27: 54,
                  28: 10,
                  29: 60,
                  30: 18,
                  31: 238,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 128,
                    1: 102,
                    2: 243,
                    3: 205,
                    4: 101,
                    5: 133,
                    6: 31,
                    7: 24,
                    8: 126,
                    9: 2,
                    10: 201,
                    11: 226,
                    12: 38,
                    13: 201,
                    14: 164,
                    15: 180,
                    16: 184,
                    17: 241,
                    18: 70,
                    19: 135,
                    20: 133,
                    21: 112,
                    22: 105,
                    23: 64,
                    24: 51,
                    25: 56,
                    26: 32,
                    27: 225,
                    28: 49,
                    29: 234,
                    30: 125,
                    31: 94,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "0362530",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "9926451",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 62,
                              1: 35,
                              2: 232,
                              3: 22,
                              4: 0,
                              5: 57,
                              6: 89,
                              7: 74,
                              8: 51,
                              9: 137,
                              10: 79,
                              11: 101,
                              12: 100,
                              13: 225,
                              14: 177,
                              15: 52,
                              16: 139,
                              17: 189,
                              18: 122,
                              19: 0,
                              20: 136,
                              21: 212,
                              22: 44,
                              23: 74,
                              24: 203,
                              25: 115,
                              26: 238,
                              27: 174,
                              28: 213,
                              29: 156,
                              30: 0,
                              31: 157,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "4182451",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "4328722",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "1000",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 3,
                  1: 42,
                  2: 104,
                  3: 214,
                  4: 14,
                  5: 101,
                  6: 151,
                  7: 220,
                  8: 63,
                  9: 39,
                  10: 126,
                  11: 17,
                  12: 195,
                  13: 158,
                  14: 104,
                  15: 80,
                  16: 57,
                  17: 106,
                  18: 127,
                  19: 143,
                  20: 42,
                  21: 128,
                  22: 223,
                  23: 246,
                  24: 79,
                  25: 227,
                  26: 110,
                  27: 47,
                  28: 142,
                  29: 112,
                  30: 67,
                  31: 31,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 50,
                    1: 178,
                    2: 30,
                    3: 182,
                    4: 59,
                    5: 208,
                    6: 122,
                    7: 238,
                    8: 220,
                    9: 249,
                    10: 44,
                    11: 126,
                    12: 171,
                    13: 84,
                    14: 52,
                    15: 44,
                    16: 151,
                    17: 202,
                    18: 109,
                    19: 19,
                    20: 174,
                    21: 40,
                    22: 216,
                    23: 235,
                    24: 72,
                    25: 166,
                    26: 63,
                    27: 17,
                    28: 35,
                    29: 117,
                    30: 55,
                    31: 157,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "3209262",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 60,
                              1: 92,
                              2: 2,
                              3: 249,
                              4: 160,
                              5: 94,
                              6: 191,
                              7: 1,
                              8: 134,
                              9: 171,
                              10: 80,
                              11: 142,
                              12: 177,
                              13: 102,
                              14: 18,
                              15: 250,
                              16: 170,
                              17: 1,
                              18: 214,
                              19: 4,
                              20: 66,
                              21: 45,
                              22: 60,
                              23: 175,
                              24: 143,
                              25: 132,
                              26: 204,
                              27: 217,
                              28: 111,
                              29: 51,
                              30: 16,
                              31: 162,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "8154212",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "2087912",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "3885445",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "100",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 3,
                  1: 97,
                  2: 236,
                  3: 153,
                  4: 192,
                  5: 236,
                  6: 242,
                  7: 217,
                  8: 178,
                  9: 94,
                  10: 200,
                  11: 228,
                  12: 159,
                  13: 77,
                  14: 168,
                  15: 86,
                  16: 253,
                  17: 158,
                  18: 43,
                  19: 206,
                  20: 115,
                  21: 136,
                  22: 248,
                  23: 92,
                  24: 167,
                  25: 64,
                  26: 185,
                  27: 202,
                  28: 240,
                  29: 121,
                  30: 232,
                  31: 45,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 174,
                    1: 113,
                    2: 157,
                    3: 7,
                    4: 166,
                    5: 18,
                    6: 8,
                    7: 138,
                    8: 253,
                    9: 79,
                    10: 138,
                    11: 232,
                    12: 250,
                    13: 44,
                    14: 173,
                    15: 175,
                    16: 132,
                    17: 120,
                    18: 174,
                    19: 31,
                    20: 34,
                    21: 25,
                    22: 63,
                    23: 11,
                    24: 62,
                    25: 108,
                    26: 253,
                    27: 4,
                    28: 91,
                    29: 118,
                    30: 253,
                    31: 103,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "1670046",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "3757739",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 60,
                              1: 92,
                              2: 2,
                              3: 249,
                              4: 160,
                              5: 94,
                              6: 191,
                              7: 1,
                              8: 134,
                              9: 171,
                              10: 80,
                              11: 142,
                              12: 177,
                              13: 102,
                              14: 18,
                              15: 250,
                              16: 170,
                              17: 1,
                              18: 214,
                              19: 4,
                              20: 66,
                              21: 45,
                              22: 60,
                              23: 175,
                              24: 143,
                              25: 132,
                              26: 204,
                              27: 217,
                              28: 111,
                              29: 51,
                              30: 16,
                              31: 162,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "4362252",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "8558894",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "100",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 3,
                  1: 114,
                  2: 177,
                  3: 248,
                  4: 56,
                  5: 228,
                  6: 192,
                  7: 24,
                  8: 90,
                  9: 238,
                  10: 68,
                  11: 148,
                  12: 211,
                  13: 89,
                  14: 123,
                  15: 45,
                  16: 34,
                  17: 197,
                  18: 59,
                  19: 38,
                  20: 133,
                  21: 77,
                  22: 100,
                  23: 137,
                  24: 7,
                  25: 177,
                  26: 167,
                  27: 198,
                  28: 114,
                  29: 192,
                  30: 56,
                  31: 46,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 235,
                    1: 147,
                    2: 147,
                    3: 221,
                    4: 247,
                    5: 5,
                    6: 75,
                    7: 184,
                    8: 98,
                    9: 7,
                    10: 189,
                    11: 72,
                    12: 224,
                    13: 106,
                    14: 127,
                    15: 97,
                    16: 30,
                    17: 75,
                    18: 148,
                    19: 136,
                    20: 44,
                    21: 149,
                    22: 138,
                    23: 250,
                    24: 18,
                    25: 207,
                    26: 166,
                    27: 114,
                    28: 243,
                    29: 28,
                    30: 89,
                    31: 100,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "1737049",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 62,
                              1: 35,
                              2: 232,
                              3: 22,
                              4: 0,
                              5: 57,
                              6: 89,
                              7: 74,
                              8: 51,
                              9: 137,
                              10: 79,
                              11: 101,
                              12: 100,
                              13: 225,
                              14: 177,
                              15: 52,
                              16: 139,
                              17: 189,
                              18: 122,
                              19: 0,
                              20: 136,
                              21: 212,
                              22: 44,
                              23: 74,
                              24: 203,
                              25: 115,
                              26: 238,
                              27: 174,
                              28: 213,
                              29: 156,
                              30: 0,
                              31: 157,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "1920057",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "0483080",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "7651959",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "1000",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 5,
                  1: 50,
                  2: 59,
                  3: 227,
                  4: 178,
                  5: 232,
                  6: 239,
                  7: 87,
                  8: 204,
                  9: 0,
                  10: 203,
                  11: 4,
                  12: 149,
                  13: 207,
                  14: 206,
                  15: 206,
                  16: 212,
                  17: 187,
                  18: 201,
                  19: 81,
                  20: 181,
                  21: 100,
                  22: 246,
                  23: 138,
                  24: 182,
                  25: 175,
                  26: 254,
                  27: 5,
                  28: 157,
                  29: 146,
                  30: 37,
                  31: 22,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 103,
                    1: 233,
                    2: 42,
                    3: 108,
                    4: 209,
                    5: 243,
                    6: 222,
                    7: 56,
                    8: 82,
                    9: 11,
                    10: 31,
                    11: 8,
                    12: 103,
                    13: 68,
                    14: 25,
                    15: 101,
                    16: 133,
                    17: 96,
                    18: 89,
                    19: 41,
                    20: 188,
                    21: 173,
                    22: 179,
                    23: 123,
                    24: 197,
                    25: 194,
                    26: 40,
                    27: 108,
                    28: 75,
                    29: 201,
                    30: 226,
                    31: 7,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "3598943",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "4197955",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 62,
                              1: 35,
                              2: 232,
                              3: 22,
                              4: 0,
                              5: 57,
                              6: 89,
                              7: 74,
                              8: 51,
                              9: 137,
                              10: 79,
                              11: 101,
                              12: 100,
                              13: 225,
                              14: 177,
                              15: 52,
                              16: 139,
                              17: 189,
                              18: 122,
                              19: 0,
                              20: 136,
                              21: 212,
                              22: 44,
                              23: 74,
                              24: 203,
                              25: 115,
                              26: 238,
                              27: 174,
                              28: 213,
                              29: 156,
                              30: 0,
                              31: 157,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "6845608",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "7343018",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "1000",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 5,
                  1: 173,
                  2: 88,
                  3: 182,
                  4: 96,
                  5: 40,
                  6: 200,
                  7: 239,
                  8: 48,
                  9: 206,
                  10: 78,
                  11: 61,
                  12: 0,
                  13: 240,
                  14: 42,
                  15: 20,
                  16: 66,
                  17: 36,
                  18: 203,
                  19: 246,
                  20: 156,
                  21: 241,
                  22: 149,
                  23: 17,
                  24: 172,
                  25: 141,
                  26: 25,
                  27: 66,
                  28: 255,
                  29: 161,
                  30: 21,
                  31: 190,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 65,
                    1: 21,
                    2: 79,
                    3: 168,
                    4: 43,
                    5: 240,
                    6: 82,
                    7: 101,
                    8: 148,
                    9: 228,
                    10: 37,
                    11: 130,
                    12: 30,
                    13: 54,
                    14: 192,
                    15: 219,
                    16: 188,
                    17: 49,
                    18: 10,
                    19: 115,
                    20: 230,
                    21: 104,
                    22: 170,
                    23: 22,
                    24: 42,
                    25: 2,
                    26: 119,
                    27: 23,
                    28: 132,
                    29: 51,
                    30: 126,
                    31: 38,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "1372731",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 60,
                              1: 92,
                              2: 2,
                              3: 249,
                              4: 160,
                              5: 94,
                              6: 191,
                              7: 1,
                              8: 134,
                              9: 171,
                              10: 80,
                              11: 142,
                              12: 177,
                              13: 102,
                              14: 18,
                              15: 250,
                              16: 170,
                              17: 1,
                              18: 214,
                              19: 4,
                              20: 66,
                              21: 45,
                              22: 60,
                              23: 175,
                              24: 143,
                              25: 132,
                              26: 204,
                              27: 217,
                              28: 111,
                              29: 51,
                              30: 16,
                              31: 162,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "7618609",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "2263012",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "3755160",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "100",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          key: {
            assetID: {
              hashID: {
                iDBytes: {
                  0: 1,
                  1: 62,
                  2: 61,
                  3: 132,
                  4: 72,
                  5: 198,
                  6: 131,
                  7: 193,
                  8: 123,
                  9: 48,
                  10: 215,
                  11: 140,
                  12: 174,
                  13: 39,
                  14: 89,
                  15: 13,
                  16: 209,
                  17: 125,
                  18: 206,
                  19: 250,
                  20: 251,
                  21: 27,
                  22: 158,
                  23: 76,
                  24: 45,
                  25: 90,
                  26: 241,
                  27: 216,
                  28: 45,
                  29: 3,
                  30: 183,
                  31: 222,
                },
              },
            },
          },
          mappable: {
            asset: {
              classificationID: {
                hashID: {
                  iDBytes: {
                    0: 250,
                    1: 26,
                    2: 200,
                    3: 185,
                    4: 62,
                    5: 75,
                    6: 231,
                    7: 135,
                    8: 71,
                    9: 230,
                    10: 116,
                    11: 238,
                    12: 62,
                    13: 232,
                    14: 238,
                    15: 126,
                    16: 240,
                    17: 60,
                    18: 31,
                    19: 189,
                    20: 139,
                    21: 110,
                    22: 87,
                    23: 190,
                    24: 229,
                    25: 52,
                    26: 142,
                    27: 103,
                    28: 83,
                    29: 51,
                    30: 179,
                    31: 94,
                  },
                },
              },
              immutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "3868952",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "a",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "5190334",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 60,
                              1: 92,
                              2: 2,
                              3: 249,
                              4: 160,
                              5: 94,
                              6: 191,
                              7: 1,
                              8: 134,
                              9: 171,
                              10: 80,
                              11: 142,
                              12: 177,
                              13: 102,
                              14: 18,
                              15: 250,
                              16: 170,
                              17: 1,
                              18: 214,
                              19: 4,
                              20: 66,
                              21: 45,
                              22: 60,
                              23: 175,
                              24: 143,
                              25: 132,
                              26: 204,
                              27: 217,
                              28: 111,
                              29: 51,
                              30: 16,
                              31: 162,
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
              mutables: {
                propertyList: {
                  anyProperties: [
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "0276925",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        data: {
                          stringData: {
                            value: "c",
                          },
                        },
                      },
                    },
                    {
                      mesaProperty: {
                        iD: {
                          keyID: {
                            iDString: "4521601",
                          },
                          typeID: {
                            iDString: "S",
                          },
                        },
                        dataID: {
                          typeID: {
                            iDString: "S",
                          },
                          hashID: {
                            iDBytes: {
                              0: 24,
                              1: 172,
                              2: 62,
                              3: 115,
                              4: 67,
                              5: 240,
                              6: 22,
                              7: 137,
                              8: 12,
                              9: 81,
                              10: 14,
                              11: 147,
                              12: 249,
                              13: 53,
                              14: 38,
                              15: 17,
                              16: 105,
                              17: 217,
                              18: 227,
                              19: 245,
                              20: 101,
                              21: 67,
                              22: 100,
                              23: 41,
                              24: 131,
                              25: 15,
                              26: 175,
                              27: 9,
                              28: 52,
                              29: 244,
                              30: 248,
                              31: 228,
                            },
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "bondAmount",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "5000",
                          },
                        },
                      },
                    },
                    {
                      metaProperty: {
                        iD: {
                          keyID: {
                            iDString: "supply",
                          },
                          typeID: {
                            iDString: "N",
                          },
                        },
                        data: {
                          numberData: {
                            value: "100",
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ],
    };

    filterProperties(response?.list);
    // filterProperties(dummyData?.list);
  }

  useEffect(() => {
    fetchNftData();
  }, []);

  return (
    <>
      <Head>
        <title>NFT Rarity Calculator</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  );
}
