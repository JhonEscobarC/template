"use client"
import { useEffect, useState } from "react";
import PreHeader from "./components/preHeader"; // Importa tu componente PreHeader
import TheHeader from "./components/header"; // Importa tu componente TheHeader
import HomeContent from "./components/homeContent"; // Importa tu componente HomeContent
import About from "./components/about"; // Importa tu componente About
import ContactUs from "./components/contactUs"; // Importa tu componente ContactUs
import TheFooter from "./components/footer";
import Catalogue from "@/app/components/catalogue";



const WebsPage = () => {
  const [websData, setWebsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const id = Number(process.env.NEXT_PUBLIC_WEB_ID)
  useEffect(() => {
    // Llamada a la API para obtener los datos
    const fetchWebsData = async () => {
      try {
        const res = await fetch(`/api/webs?id=${id}`);
        if (!res.ok) {
            new Error("Failed to fetch data");
        }
        const data = await res.json();
        setWebsData(data);
        document.documentElement.style.setProperty("--secondBackground", data?.color1);
        document.documentElement.style.setProperty("--shadowColor", data?.color2);
        document.documentElement.style.setProperty("--hoverColor", data?.color3);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
    const structuredData = {
        ...websData,
        home: websData.home?.[0] || {},  // Tomar el primer elemento del array
        about_us: websData.about_us?.[0] || {},
        footer: websData.footer?.[0] || {},
        header: websData.header?.[0] || {},
        catalogo: websData.catalogo?.[0] || {},
        members: websData.members?.[0] || {},
        contact_us: websData.contact_us?.[0] || {},
    };
  const webData = structuredData;

  return (
      <div>
        <PreHeader webData={webData} />
        <TheHeader webData={webData} />
        <HomeContent webData={webData} />
        <About webData={webData} />
        <ContactUs webData={webData} />
        <Catalogue webData={webData} />
        <TheFooter webData={webData} />
      </div>
  );
};

export default WebsPage;
