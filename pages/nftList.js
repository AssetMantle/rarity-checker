import { useEffect, useState } from "react";
import { RiNumbersFill } from "react-icons/ri";
import { BsFillBarChartFill } from "react-icons/bs";
import { LuFilter } from "react-icons/lu";
import { BiSort } from "react-icons/bi";
import Link from "next/link";

const style = {
  wrapper: "grid grid-cols-[15%_85%] w-screen h-full",
  filtersContainer: "bg-black text-white sticky top-0 left-0",
  nftCardsContainer: "h-[100%] bg-emerald-500",
};

function nftList() {
  const [nftData, setNftData] = useState([]);
  const [collectionData, setCollectionData] = useState({});
  const [imageLoaded, setImageLoaded] = useState(false);
  const [ascendingOrder, setAscendingOrder] = useState(true);
  const [searchLanguage, setSearchLanguage] = useState("");
  const [rankFrom, setRankFrom] = useState("");
  const [rankTo, setRankTo] = useState("");
  const sortedData = [...nftData].sort((a, b) =>
    ascendingOrder
      ? a.rarity?.rank - b.rarity?.rank
      : b.rarity?.rank - a.rarity?.rank
  );

  const toggleOrder = () => {
    setAscendingOrder((prevOrder) => !prevOrder);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  const getNFTData = () => {
    fetch("data/ethereumData.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setNftData(myJson);
      });
  };
  useEffect(() => {
    getNFTData();
  }, []);
  const getCollectionData = () => {
    fetch("data/ethCollectionData.json")
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
            <div className="bg-[#252525] rounded-xl overflow-y-auto">
              <div className="flex flex-col gap-6 ">
                <div>
                  <div className="bg-[#111111]/30 py-3 px-4 text-white font-medium text-base flex gap-2 items-center">
                    <LuFilter size={16} />
                    Filters
                  </div>
                  <div className="h-[2px] w-full bg-[#383838]"></div>
                </div>
                <div className="flex flex-col gap-2 px-4">
                  <div className="text-white/40 font-medium text-sm">Rank</div>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      className="w-full px-2 py-2 bg-transparent border border-white/20 text-white rounded-lg placeholder-white/20 text-sm focus:border-[#ffc640] outline-none focus:text-white"
                      placeholder="From"
                      value={rankFrom}
                      onChange={(e) => setRankFrom(e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full px-2 py-2 bg-transparent border border-white/20 text-white rounded-lg placeholder-white/20 text-sm focus:border-[#ffc640] outline-none focus:text-white"
                      placeholder="To"
                      value={rankTo}
                      onChange={(e) => setRankTo(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="bg-[#ffc640] px-4 outline-none rounded-b-lg w-full text-sm font-medium py-2 disabled:cursor-not-allowed"
                  disabled={!rankFrom || !rankTo}
                >
                  Filter items
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-1 mx-4">
            <div className="h-screen overflow-y-auto py-4">
              <div className="bg-[#252525] p-4 rounded-xl flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={searchLanguage}
                    onChange={(e) =>
                      setSearchLanguage(e.target.value.toLowerCase())
                    }
                    className="flex-1 p-2 bg-transparent border border-white/20 rounded-lg placeholder-white/20 text-sm text-white focus:border-[#ffc640] outline-none focus:text-white"
                    placeholder="Enter keyword to search"
                  />
                  <div
                    className={`rounded-lg p-2 cursor-pointer ${
                      ascendingOrder
                        ? "bg-[#ffc640] border border-transparent text-[#252525]"
                        : "border border-[#ffc640] text-[#ffc640]"
                    }`}
                    onClick={toggleOrder}
                  >
                    <BiSort size={16} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-y-4 gap-x-4">
                  {sortedData &&
                    sortedData.map((nft, index) => (
                      <div
                        key={index}
                        className={`w-[calc(25%-.8rem)] p-4 bg-[#030301] rounded-xl flex flex-col gap-2 ${
                          nft?.metadata?.name
                            .toLowerCase()
                            .startsWith(searchLanguage)
                            ? "block"
                            : "hidden"
                        }
                        ${
                          rankFrom &&
                          rankTo &&
                          (nft?.rarity?.rank >= rankFrom &&
                          nft?.rarity?.rank <= rankTo
                            ? "block"
                            : "hidden")
                        }
                        `}
                      >
                        <Link href={`nft/${nft?.token_id}`}>
                          <div className="flex justify-center items-center">
                            {!imageLoaded && (
                              <div className="bg-gray-300 animate-pulse" />
                            )}
                            <img
                              src={nft?.cached_file_url}
                              alt="Image"
                              className={` ${imageLoaded ? "" : "hidden"}`}
                              onLoad={handleImageLoad}
                            />
                          </div>
                          <div className="text-sm truncate text-white/40">
                            {nft?.metadata?.name}
                          </div>
                          <div className="text-[#ffc640] text-sm flex gap-1 items-center">
                            <BsFillBarChartFill size={14} />
                            {nft?.rarity?.rank}
                          </div>
                        </Link>
                      </div>
                    ))}
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

export default nftList;
