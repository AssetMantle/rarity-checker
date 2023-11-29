import Link from "next/link";
import React, { useEffect, useState } from "react";
import RCLogo from "../Components/RCLogo";
import { FaChevronDown } from "react-icons/fa6";
import HistoryCard from "../Components/HistoryCard";

export default function Header() {
  const [ShowHistory, setShowHistory] = useState(false);

  useEffect(() => {}, []);

  return (
    <header className="rc-container-fluid">
      <div className="rc-container rc-header">
        <Link href="/">
          <RCLogo hideSmall={true} />
        </Link>

        <button
          className="rc-header-history"
          onClick={() => setShowHistory(!ShowHistory)}
        >
          History <FaChevronDown />
          {ShowHistory && (
            <div className="content">
              <div className="content-box">
                <HistoryCard
                  title={"Page one"}
                  subtitle={"Lorem ipsum dolor sit amet consectetur elit"}
                />
                <HistoryCard
                  title={"Page one"}
                  subtitle={"Lorem ipsum dolor sit amet consectetur elit"}
                />
                <HistoryCard
                  title={"Page one"}
                  subtitle={"Lorem ipsum dolor sit amet consectetur elit"}
                />
                <HistoryCard
                  title={"Page one"}
                  subtitle={"Lorem ipsum dolor sit amet consectetur elit"}
                />
                <HistoryCard
                  title={"Page one"}
                  subtitle={"Lorem ipsum dolor sit amet consectetur elit"}
                />
              </div>
            </div>
          )}
        </button>
      </div>
      <i className="rc-divider" />
    </header>
  );
}
