import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllTasks } from "~~/api/vayam-ai/tasks";
import { Loading } from "~~/components/vayam-ai";
import SomethingWentWrong from "~~/components/vayam-ai/SomethingWentWrong";

// import { ResultCard } from "~~/components/vayam-ai/search";

const Jobs = () => {
  const allTasksQuery = useQuery({
    queryKey: ["allTasks"],
    queryFn: () => getAllTasks(),
  });
  console.log(allTasksQuery.data);

  return (
    <div>
      <div className="text-3xl font-bold mt-5">Jobs List</div>
      {/* result */}
      {allTasksQuery.isLoading ? (
        <div className="w-fit mx-auto mt-10">
          <Loading />
        </div>
      ) : allTasksQuery.isError ? (
        <div>
          <SomethingWentWrong />
        </div>
      ) : allTasksQuery.data.results <= 0 ? (
        <div className="w-fit mx-auto">
          <SomethingWentWrong title={"No job yet!"} />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* {allTasksQuery.data.tasks.map((task) => (
            <ResultCard key={task.}/>
          ))} */}
        </div>
      )}
    </div>
  );
};

export default Jobs;
