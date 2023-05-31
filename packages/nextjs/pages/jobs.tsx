import React from "react";
import { ResultCard } from "~~/components/vayam-ai/search";

const Jobs = () => {
  return (
    <div>
      <div className="text-3xl font-bold mt-5">Jobs List</div>
      {/* result */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ResultCard />
        <ResultCard />
        <ResultCard />
        <ResultCard />
        <ResultCard />
      </div>
    </div>
  );
};

export default Jobs;
