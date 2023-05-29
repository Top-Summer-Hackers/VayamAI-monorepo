import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <main>
      <div className="w-[80%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* introduction */}
        <div className="flex flex-col items-start justify-center gap-5">
          <div className="w-full">
            <h2 className="w-full text-3xl font-bold text-center lg:text-left">Revolutionizing Freelancing</h2>
            <h4 className="mt-5 text-lg lg:text-xl font-semibold text-center lg:text-left">
              The Future of Decentralized Employment
            </h4>
          </div>
          <div className="mx-auto lg:mx-0 mt-5 w-fit connect-bg px-8 py-2 rounded-full font-semibold cursor-pointer">
            Explore now
          </div>
        </div>
        {/* image */}
        <div>
          <img src="/landing/landing_image.png" alt="landing's image" />
        </div>
      </div>
    </main>
  );
};

export default Home;
