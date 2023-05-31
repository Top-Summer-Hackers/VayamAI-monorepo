import React from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";

interface SomethingWentWrongProps {
  title?: string;
}

const SomethingWentWrong = ({ title }: SomethingWentWrongProps) => {
  return (
    <div className="w-fit mx-auto flex flex-col justify-center items-center">
      <div className="text-5xl text-sideColor">
        <AiOutlineExclamationCircle />
      </div>
      <div className="text-2xl font-semibold">Oops!</div>
      <div className="text-xl">{title != undefined ? title : "Something went wrong."}</div>
    </div>
  );
};

export default SomethingWentWrong;
