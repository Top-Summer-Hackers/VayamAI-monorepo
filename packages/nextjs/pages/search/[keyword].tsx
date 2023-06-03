import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getTaskBySkills } from "~~/api/vayam-ai/tasks";
import { Loading } from "~~/components/vayam-ai";
import SomethingWentWrong from "~~/components/vayam-ai/SomethingWentWrong";
import { ResultCard } from "~~/components/vayam-ai/search";
import { TaskList } from "~~/types/vayam-ai/Task";

// import { ResultCard } from "~~/components/vayam-ai/search";

const Search = () => {
  const router = useRouter();
  const { keyword } = router.query;

  const jobSearchBySkillQuery = useQuery({
    queryKey: ["jobSearchBySkill"],
    queryFn: () => getTaskBySkills(String(keyword) != undefined ? String(keyword) : ""),
  });

  console.log(jobSearchBySkillQuery.data);

  return (
    <div>
      <div className="text-3xl font-bold mt-5">Recommended Result</div>
      {/* result */}
      {jobSearchBySkillQuery.isLoading ? (
        <div className="w-fit mx-auto mt-10">
          <Loading />
        </div>
      ) : jobSearchBySkillQuery.isError ? (
        <SomethingWentWrong />
      ) : jobSearchBySkillQuery.data.results <= 0 ? (
        <SomethingWentWrong title={"No result!"} />
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobSearchBySkillQuery.data.tasks.map((task: TaskList) => (
            <ResultCard key={task.id} taskDetail={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
