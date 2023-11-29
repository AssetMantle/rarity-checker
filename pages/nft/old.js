"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GiRank1 } from "react-icons/gi";
import { BsGraphUpArrow } from "react-icons/bs";
import { CiBoxList } from "react-icons/ci";

function nftDetail() {
  const [NftID, setNftID] = useState();
  const [nftData, setNftData] = useState([]);
  const [collectionData, setCollectionData] = useState({});
  const [nftNftPropertyData, setNftPropertyData] = useState([]);
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
    <div className="min-h-[100%] flex items-center justify-center bg-[#111111]">
      <div className="w-full px-4">
        <div className="grid grid-cols-[15%_70%_15%]">
          <div className="col-span-1 sticky top-0 py-4">
            <div className="flex flex-col">
              <div className="bg-[#252525] rounded-xl">
                <div className="flex flex-col gap-3 px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-[#ffc640] font-medium text-sm">
                      Mint date
                    </div>
                    <div className="text-white/40 text-xs">
                      {/* {new Date(nftData?.mint_date)} */}
                      {nftData?.mint_date}
                    </div>
                  </div>
                  <div className="h-[2px] w-full bg-[#383838]"></div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[#ffc640] font-medium text-sm">
                      Owner
                    </div>
                    <div className="text-white/40 text-xs truncate">
                      {(nftData?.owner && (
                        <a
                          href={`https://etherscan.io/address/${nftData?.owner}`}
                        >
                          {nftData?.owner}
                        </a>
                      )) ||
                        "--"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 mx-4">
            <div className="h-screen overflow-y-auto py-4">
              <div className="bg-[#252525] p-4 rounded-xl flex flex-col gap-4">
                <div className="flex gap-4 p-4 bg-[#030301] rounded-xl">
                  <div className="w-80 rounded-xl overflow-hidden">
                    {nftData?.cached_file_url && (
                      <img src={nftData?.cached_file_url} alt="Image" />
                    )}
                  </div>
                  <div className="w-full flex flex-col justify-between text-white font-medium text-xl">
                    {nftData?.metadata?.name && nftData?.metadata?.name}
                    <div className="w-4/5 grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2 items-center border border-[#383838] rounded-xl">
                        <div className="w-full flex gap-2 items-center border-b border-[#383838] px-4 py-2">
                          <GiRank1 size={20} className="text-[#ffc640]" />
                          <div className="text-[#ffc640] font-medium text-xs">
                            Collection rank
                          </div>
                        </div>
                        <div className="text-white text-lg px-4 py-2">
                          {nftData?.rarity?.rank}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-center border border-[#383838] rounded-xl">
                        <div className="w-full flex gap-2 items-center border-b border-[#383838] px-4 py-2">
                          <BsGraphUpArrow
                            size={16}
                            className="text-[#ffc640]"
                          />
                          <div className="text-[#ffc640] font-medium text-xs">
                            Item rarity score
                          </div>
                        </div>
                        <div className="text-white text-lg px-4 py-2">
                          {nftData?.total_rarity_score}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-center border border-[#383838] rounded-xl">
                        <div className="w-full flex gap-2 items-center border-b border-[#383838] px-4 py-2">
                          <CiBoxList size={20} className="text-[#ffc640]" />
                          <div className="text-[#ffc640] font-medium text-xs">
                            Item traits
                          </div>
                        </div>
                        <div className="text-white text-lg px-4 py-2">
                          {nftNftPropertyData?.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-[#030301] rounded-xl px-4 p-2">
                  <div className="flex flex-col text-white">
                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full py-2">
                        <div className="overflow-hidden">
                          <table className="min-w-full text-left text-sm font-light">
                            <thead className="border-b border-[#383838] font-medium">
                              <tr>
                                <th scope="col" className="px-6 py-4">
                                  Type
                                </th>
                                <th scope="col" className="px-6 py-4">
                                  Value
                                </th>
                                <th scope="col" className="px-6 py-4">
                                  Quantity
                                </th>
                                <th scope="col" className="px-6 py-4">
                                  Score
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {nftNftPropertyData &&
                                nftNftPropertyData.map((property, index) => (
                                  <tr
                                    key={index}
                                    className="transition duration-300 ease-in-out text-[#B0B0B0]"
                                  >
                                    <td className="whitespace-nowrap px-6 py-2 font-medium">
                                      {property?.trait_type}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-2">
                                      {property?.value}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-2">
                                      {property?.statistics?.total_count}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-2">
                                      {property?.rarity_score}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 sticky top-0 py-4">
            <div className="flex flex-col relative top-10">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <img
                  src={collectionData?.contract?.metadata?.thumbnail_url}
                  className="h-24 w-24 rounded-lg"
                />
              </div>
              <div className="bg-[#252525] rounded-xl pt-16">
                <div className="flex flex-col gap-3 px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-[#ffc640] font-medium text-sm">
                      Collection
                    </div>
                    <div className="text-white/40 text-xs">
                      {collectionData?.contract?.name}
                    </div>
                  </div>
                  <div className="h-[2px] w-full bg-[#383838]"></div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[#ffc640] font-medium text-sm">
                      Description
                    </div>
                    <div className="text-white/40 text-xs">
                      {collectionData?.contract?.metadata?.description}
                    </div>
                  </div>
                  <div className="h-[2px] w-full bg-[#383838]"></div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[#ffc640] font-medium text-sm">
                      Size
                    </div>
                    <div className="text-white/40 text-xs">
                      {collectionData?.total}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
