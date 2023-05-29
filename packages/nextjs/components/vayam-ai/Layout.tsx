import React, { PropsWithChildren } from "react";
import Head from "next/head";
import Navbar from "./Navbar";

// import Navbar from "./Navbar";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="px-5 py-2 w-full min-h-screen mx-auto relative bg-main text-white">
      <Head>
        <title>VayamAI</title>
      </Head>
      <Navbar />
      <div className="max-w-[1980px] mx-auto">{children}</div>
    </div>
  );
};

export default Layout;
