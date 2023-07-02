import React from "react";
import { Milestone } from "~~/types/vayam-ai/Proposal";

interface JobMilestoneListProps {
  // proposalId: string;
  milestones: Milestone[];
}

const JobMilestoneList = ({ milestones }: JobMilestoneListProps) => {
  // const [milestones, setMilestones] = useState<Milestone[]>([]);

  // const proposalDetailQuery = useQuery({
  //   queryKey: ["proposalDetailQuery", proposalId],
  //   enabled: proposalId != "-1",
  //   staleTime: Infinity,
  //   queryFn: () => getProposal(proposalId),
  //   onSuccess: data => {
  //     setMilestones(data.data.detailed_proposal.milestones);
  //   },
  // });

  return (
    <div className="flex flex-col gap-3">
      {milestones.map((milestone, index) => (
        <div key={milestone.description + index} className="border-l-2 pl-3 border-sideColor">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{milestone.description}</div>
              <div>Deadline: {milestone.deadline}</div>
              <div>Price: {milestone.price}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobMilestoneList;
