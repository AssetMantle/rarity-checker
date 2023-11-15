import React, { useEffect, useState } from "react";
import { fetchNftData, fetchNftData2 } from "./api/data";
import { BsFillBarChartFill } from "react-icons/bs";

function amNftList() {
  const [nftData, setNftData] = useState([]);
  const [ascendingOrder, setAscendingOrder] = useState(true);
  const sortedData = [...nftData].sort((a, b) =>
    ascendingOrder ? a?.rank - b?.rank : b?.rank - a?.rank
  );

  async function fetchData() {
    // let response = await fetchNftData();
    // setNftData(response);
    let response = await fetchNftData2();
    setNftData(response);
  }

  useEffect(() => {
    // fetchData();
  }, []);

  return (
    <div className="min-h-[100%] py-12 flex items-center justify-center bg-[#111111]">
      <div className="w-full px-4">
        <div className="flex flex-wrap gap-y-4 gap-x-4">
          {sortedData &&
            sortedData.map((nft, index) => (
              <div
                key={index}
                className="w-[calc(25%-.8rem)] text-white bg-[#030301] border border-white/20 rounded-xl flex flex-col gap-2"
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
                        <div className="text-white/30 border-t border-white/20 py-1 px-3 text-center">
                          {property?.rarityScore}
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

export default amNftList;
