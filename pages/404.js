import Link from "next/link";
import React from "react";

export default function Custom404() {
  return (
    <main className="rc-container rc-error">
      <h1>
        The Page you are trying to access does not exist.{" "}
        <Link href="/">Start Again</Link>
      </h1>
    </main>
  );
}
