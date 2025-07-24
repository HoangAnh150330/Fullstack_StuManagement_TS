import React from "react";
import HeaderBar from "../../components/Home/Headerbar";
import "./HomePage.css";
import img1 from "../../assets/bg1.jpg";

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <HeaderBar />
      <div className="home-content">
        <div className="home-text">
          <h1>Chào mừng bạn đến với hệ thống quản lý học sinh</h1>
        </div>
        <img src={img1} alt="Welcome" className="home-image" />
      </div>
    </div>
  );
};

export default HomePage;
