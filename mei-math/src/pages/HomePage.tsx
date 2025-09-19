import React from "react";
import Header from "../components/header";
import BannerHome from "../components/banner-home";
import InfoHome from "../components/info-home";
import Footer from "../components/footer";

const HomePage: React.FC = () => {
  return (
    <div>
      <Header  />
      <BannerHome />
       <InfoHome /> 
      <Footer />
    </div>
  );
};

export default HomePage;