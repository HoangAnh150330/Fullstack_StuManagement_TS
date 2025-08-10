import React, { useEffect, useState } from "react";
import HeaderBar from "../../components/Home/Headerbar";
import img1 from "../../assets/bg1.jpg";

const HomePage: React.FC = () => {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    // hiệu ứng vào màn
    const t = setTimeout(() => setEntered(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <HeaderBar />

      <div
        className={[
          "flex-1 flex items-center justify-center",
          "px-6 sm:px-10 lg:px-16 py-10",
          "gap-10 lg:gap-20 text-left",
          "transition-all duration-700 ease-out",
          entered ? "opacity-100 scale-100" : "opacity-0 scale-95",
          "flex-col lg:flex-row",
        ].join(" ")}
      >
        {/* Text */}
        <div
          className={[
            "max-w-xl",
            "transition-all duration-700 ease-out",
            entered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
          ].join(" ")}
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-snug hover:text-blue-700 transition-colors">
            Chào mừng bạn đến với hệ thống quản lý học sinh
          </h1>
        </div>

        {/* Image */}
        <img
          src={img1}
          alt="Welcome"
          className={[
            "w-full sm:w-auto max-w-md lg:max-w-lg rounded-2xl shadow-2xl",
            "transition-all duration-700 ease-out",
            entered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10",
          ].join(" ")}
        />
      </div>
    </div>
  );
};

export default HomePage;
