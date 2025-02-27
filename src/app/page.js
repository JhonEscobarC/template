"use client";

import {useEffect, useRef, useState} from "react";
import TheHeader from "@/app/components/header";
import HomeContent from "@/app/components/homeContent";
import PreHeader from "@/app/components/preHeader";
import About from "@/app/components/about";
import ContactUs from "@/app/components/contactUs";
import Catalogue from "@/app/components/catalogue";
import TheFooter from "@/app/components/footer";
import LoadingIndicator from "@/app/components/infoView";
import ErrorIndicator from "@/app/components/errorView";

const Home = () => {
  const id = process.env.NEXT_PUBLIC_WEB_ID
  const [webData, setWebData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const listaRef = useRef([]);


  useEffect(() => {
    if (!id) {
      console.warn("⚠️ ID no disponible aún, esperando...");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/webs?id=${id}`);

        if (!res.ok) {
          throw new Error("❌ Error en la respuesta de la API");
        }

        const data = await res.json();

        // Asegurar que tomamos los valores correctos dentro de arrays
        const structuredData = {
          color1: data.color1,
          color2: data.color2,
          color3: data.color3,
            link1: data.link1,
            link2: data.link2,
            link3: data.link3,
          home: data.home?.[0] || {},  // Tomar el primer elemento del array
          about_us: data.about_us?.[0] || {},
          footer: data.footer?.[0] || {},
          header: data.header?.[0] || {},
          catalogo: data.catalogo?.[0] || {},
          members: data.members?.[0] || {},
          contact_us: data.contact_us?.[0] || {},
        };
        document.documentElement.style.setProperty("--secondBackground", data?.color1);
        document.documentElement.style.setProperty("--shadowColor", data?.color2);
        document.documentElement.style.setProperty("--hoverColor", data?.color3);
        setWebData(structuredData);
        setFormData(structuredData);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const uploadFileToS3 = async (file, name, e) => {
    const blob = new Blob([file], { type: file.type });
    const formData = new FormData();
    formData.append("file", blob, file.name); // Asegúrate de incluir el nombre del archivo
    formData.append("folder", name );
    e.preventDefault();
    const res = await fetch("/api/uploadFileToS3", {
      method: "POST",
      body: formData,
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
    const data = await res.json();
    if (data.success) {
      return data.url;
    }


    return console.error("Error al subir archivo a S3");
  };
  const updateNestedProperty = (obj, path, value) => {
    const keys = path.split("."); // Divide la ruta en un array de claves
    let current = obj;

    // Recorre las claves para llegar al último nivel
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {}; // Si no existe, crea un objeto vacío
      }
      current = current[key];
    }

    // Asigna el valor a la última clave
    current[keys[keys.length - 1]] = value;
  };
  const processFilesAndUpdateFormData = async (e) => {
    const updatedFormData = { ...formData }; // Copia de formData para actualizarlo

    // Recorrer los elementos en listaRef
    for (const item of listaRef.current) {
      const { campo, valor, file } = item;
      try {
        const url = await uploadFileToS3(file, formData.owner.business, e);
        updateNestedProperty(updatedFormData, campo, url);

      } catch (error) {
        console.error("Error al subir archivo:", error);
        alert("Error al subir archivo. Intenta de nuevo.");
        return false; // Devolver false si ocurre un error
      }
    }

    setFormData(updatedFormData);
    return true; // Retorna true si todo se procesó correctamente
  };
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    const keys = name.split(".");

    setFormData((prev) => {
      const updatedData = { ...prev };
      let ref = updatedData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!ref[keys[i]]) ref[keys[i]] = { ...prev[keys[i]] };
        ref = ref[keys[i]];
      }

      if (type === "file") {
        const file = files[0];

        if (file) {
          const allowedTypes = ["image/png", "image/jpeg"];
          const maxSize = 2 * 1024 * 1024; // 2MB

          if (!allowedTypes.includes(file.type)) {
            alert("Solo se permiten archivos PNG y JPG.");
            return prev;
          }

          if (file.size > maxSize) {
            alert("El archivo es demasiado grande. Máximo permitido: 2MB.");
            return prev;
          }

          // Verificar si ya se guardó antes
          const yaGuardado = listaRef.current.some((item) => item.campo === name);

          if (!yaGuardado) {
            listaRef.current.push({ campo: name, valor: ref[keys[keys.length - 1]], file: file });
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            ref[keys[keys.length - 1]] = event.target.result;
            setFormData({ ...updatedData });
          };
          reader.readAsDataURL(file);
        }
      } else {
        ref[keys[keys.length - 1]] = value;
      }

      return updatedData;
    });
    
    document.documentElement.style.setProperty("--secondBackground", formData.color1);
    document.documentElement.style.setProperty("--shadowColor", formData.color2);
    document.documentElement.style.setProperty("--hoverColor", formData.color3);
  };
  const deploy = async (deployId, e) => {
    try {
     const businessName = formData.owner.business.replace(/\s+/g, '-').toLowerCase();
      e.preventDefault();
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deployId , name: businessName }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Error al desplegar: " + ("Respuesta inesperada"));
      }
      return data
    } catch (error) {
      console.error("❌ Error desplegando sitio web:", error.stack || error);
      if (error.name === "AbortError") {
        alert("La solicitud tardó demasiado. Por favor, intenta de nuevo.");
      } else {
        alert("Error al desplegar: " + (error.message || "Error desconocido"));
      }
    }
  }
  const handleSave = async (e) => {
    try {
      setSaving(true);
      e.preventDefault(); // Evita el envío automático del formulario

      if (!formData.owner.business) {
        alert("El nombre del negocio es obligatorio.");
        return;
      }
      if (!formData.owner.name) {
        alert("El nombre del propietario es obligatorio.");
        return;
      }
      if (!formData.owner.id_number) {
        alert("El número de cédula es obligatorio.");
        return;
      }
      // Validar que formData no esté vacío
      if (!formData || Object.keys(formData).length === 0) {
        alert("No hay datos para guardar.");
        return;
      }
      await processFilesAndUpdateFormData(e)

      e.preventDefault();
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData.owner),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Error al guardar: " + (data.message || "Respuesta inesperada"));
        return;
      }
      formData.owner.id = data.id;
      formData.developer = 2;
      e.preventDefault();
      const createRes = await fetch("/api/createWeb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const createData = await createRes.json();
      const deployData = await deploy(createData.id, e)
      if (createData.success && deployData.success) {
        alert("Datos guardados correctamente");
      } else {
        alert("Error al guardar: " + ("Respuesta inesperada"));
      }
      setSaving(false);
      window.location.href = '/'
    } catch (error) {
      setSaving(false);
      setWebData(false);
      console.error("❌ Error guardando datos:", error.stack || error);
      if (error.name === "AbortError") {
        alert("La solicitud tardó demasiado. Por favor, intenta de nuevo.");
      } else {
        alert("Error al guardar: " + (error.message || "Error desconocido"));
      }
    }
  };


  if (saving) return <LoadingIndicator message=" Guardando datos..." />;
  if (loading) return  <LoadingIndicator message=" Cargando datos..." />;
  if (!webData) return <ErrorIndicator message="Error al cargar datos" />;

  return (
      <div className="flex gap-4 p-4 h-screen ">
        {/* Formulario de edición */}
        <div className="w-1/3 h-full overflow-auto p-4 border rounded-lg shadow-md items-center">
          <h2 className="text-xl font-bold mb-4">Guardar Datos</h2>
          <form className="space-y-4">
            {/* Formulario de Datos Personales */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">📋 Datos Personales</h2>
              <hr className="mb-4 border-gray-300"/>

              {/* Nombre Completo */}
              <div className="p-4 border rounded-lg shadow-md flex flex-col gap-2">
                <label className="font-medium">Nombre Completo:</label>
                <input
                    type="text"
                    name="owner.name"
                    onChange={handleChange}
                    className="border p-2 rounded"
                    placeholder="Ingresa nombre completo"
                    required
                />
              </div>

              {/* Nombre de Negocio */}
              <div className="p-4 border rounded-lg shadow-md flex flex-col gap-2 mt-4">
                <label className="font-medium">Nombre de Negocio:</label>
                <input
                    type="text"
                    name="owner.business"
                    onChange={handleChange}
                    className="border p-2 rounded"
                    placeholder="Ingresa el nombre del negocio"
                    required
                />
              </div>

              {/* Número de Cédula */}
              <div className="p-4 border rounded-lg shadow-md flex flex-col gap-2 mt-4">
                <label className="font-medium">Número de Cédula:</label>
                <input
                    type="tel"
                    name="owner.id_number"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      handleChange({target: {name: e.target.name, value}});
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Backspace" && e.key !== "Delete" && !/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="border p-2 rounded"
                    placeholder="Ingresa número de cédula"
                    required
                />
              </div>
            </div>

            {/* Colors Section */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">🎨 Colores</h2>
              <hr className="mb-4 border-gray-300"/>

              <div className="grid gap-4">
                {/* Color 1 */}
                <div className="p-4 border rounded-lg shadow-md flex items-center gap-4">
                <label className="block font-medium">Color 1:</label>
                  <input
                      type="color"
                      name="color1"
                      onChange={handleChange}
                      className="border p-1 rounded"
                  />
                  <div className="w-10 h-10 rounded border"
                       style={{backgroundColor: formData.color1}}></div>
                </div>

                {/* Color 2 */}
                <div className="p-4 border rounded-lg shadow-md flex items-center gap-4">
                  <label className="block font-medium">Color 2:</label>
                  <input
                      type="color"
                      name="color2"
                      onChange={handleChange}
                      className="border p-1 rounded"
                  />
                  <div className="w-10 h-10 rounded border"
                       style={{backgroundColor: formData.color2}}></div>
                </div>

                {/* Color 3 */}
                <div className="p-4 border rounded-lg shadow-md flex items-center gap-4">
                  <label className="block font-medium">Color 3:</label>
                  <input
                      type="color"
                      name="color3"
                      onChange={handleChange}
                      className="border p-1 rounded"
                  />
                  <div className="w-10 h-10 rounded border"
                       style={{backgroundColor: formData.color3}}></div>
                </div>
              </div>
            </div>

            {/* Links Section */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">🔗 Links</h2>
              <hr className="mb-4 border-gray-300"/>

              <div className="grid gap-4">
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Link Facebook:</label>
                  <input
                      type="text"
                      name="link1"
                      placeholder={webData.link1}
                      onChange={handleChange}
                      className="border p-2 w-full rounded"
                  />
                </div>

                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Link Instagram:</label>
                  <input
                      type="text"
                      name="link2"
                      placeholder={webData.link2}
                      onChange={handleChange}
                      className="border p-2 w-full rounded"
                  />
                </div>

                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Link Whatsapp:</label>
                  <input
                      type="text"
                      name="link3"
                      placeholder={webData.link3}
                      onChange={handleChange}
                      className="border p-2 w-full rounded"
                  />
                </div>
              </div>
            </div>


            {/* Header */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">📌 Header</h2>
              <hr className="mb-4 border-gray-300"/>
              <div className="p-4 border rounded-lg shadow-md">
                <label className="block font-medium">Logo Header:</label>
                <input type="file" accept="image/png, image/jpeg" name="header.logo"
                       placeholder={webData.header.logo} onChange={handleChange}
                       className="border p-2 w-full rounded"/>
              </div>
            </div>

            {/* Home */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">🏡 Home</h2>
              <hr className="mb-4 border-gray-300"/>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Título Home:</label>
                  <input type="text" name="home.titulo" placeholder={webData.home.titulo}
                         onChange={handleChange} className="border p-2 w-full rounded"/>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Imagen Home:</label>
                  <input type="file" accept="image/png, image/jpeg" name="home.imagen"
                         placeholder={webData.home.imagen} onChange={handleChange}
                         className="border p-2 w-full rounded"/>
                </div>
              </div>
            </div>

            {/* About Us */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">ℹ️ About Us</h2>
              <hr className="mb-4 border-gray-300"/>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Título About Us:</label>
                  <input type="text" name="about_us.titulo" placeholder={webData.about_us.titulo}
                         onChange={handleChange} className="border p-2 w-full rounded"/>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Texto About Us:</label>
                  <textarea name="about_us.texto" placeholder={webData.about_us.texto}
                            onChange={handleChange} className="border p-2 w-full rounded"/>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Imagen About Us:</label>
                  <input type="file" accept="image/png, image/jpeg" name="about_us.imagen"
                         placeholder={webData.about_us.imagen} onChange={handleChange}
                         className="border p-2 w-full rounded"/>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">📞 Contacto</h2>
              <hr className="mb-4 border-gray-300"/>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Texto Contacto:</label>
                  <textarea name="contact_us.texto" placeholder={webData.contact_us.texto}
                            onChange={handleChange} className="border p-2 w-full rounded"/>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Imagen Contacto:</label>
                  <input type="file" accept="image/png, image/jpeg" name="contact_us.imagen"
                         placeholder={webData.contact_us.imagen} onChange={handleChange}
                         className="border p-2 w-full rounded"/>
                </div>
              </div>
            </div>

            {/* Catálogo */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">📦 Catálogo</h2>
              <hr className="mb-4 border-gray-300"/>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Título Catálogo:</label>
                  <input type="text" name="catalogo.titulo" placeholder={webData.catalogo.titulo}
                         onChange={handleChange} className="border p-2 w-full rounded"/>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Texto Catálogo:</label>
                  <textarea name="catalogo.texto" placeholder={webData.catalogo.texto}
                            onChange={handleChange} className="border p-2 w-full rounded"/>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Imagen Catálogo:</label>
                  <input type="file" accept="image/png, image/jpeg" name="catalogo.imagen"
                         placeholder={webData.catalogo.imagen} onChange={handleChange}
                         className="border p-2 w-full rounded"/>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">🔽 Footer</h2>
              <hr className="mb-4 border-gray-300"/>

              <div className="grid gap-4">
                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Logo Footer:</label>
                  <input type="file" accept="image/png, image/jpeg"  name="footer.logo" placeholder={webData.footer.logo}
                         onChange={handleChange} className="border p-2 w-full rounded"/>
                </div>

                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Slogan:</label>
                  <input type="text" name="footer.slogan" placeholder={webData.footer.slogan}
                         onChange={handleChange} className="border p-2 w-full rounded"/>
                </div>

                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Correo:</label>
                  <input type="text" name="footer.correo" placeholder={webData.footer.correo}
                         onChange={handleChange} className="border p-2 w-full rounded"/>
                </div>

                <div className="p-4 border rounded-lg shadow-md">
                  <label className="block font-medium">Número telefonico:</label>
                  <input
                      type="tel"
                      name="footer.numero"
                      placeholder={webData.footer.numero}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        handleChange({target: {name: e.target.name, value}});
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Backspace" && e.key !== "Delete" && !/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="border p-2 w-full rounded"
                  />

                </div>

              </div>
            </div>

            <button
                type="submit"
                onClick={handleSave}
                className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg shadow-md
               hover:bg-blue-700 hover:shadow-lg
               active:bg-blue-800 active:scale-95
               transition-all duration-200"
            >
              Guardar Datos
            </button>

          </form>
        </div>

        {/* Vista previa en tiempo real */}
        <div className="w-2/3 h-full overflow-auto p-4 border rounded-lg shadow-md items-center">
          <h2 className="text-xl font-bold mb-4">Vista Previa</h2>

          <PreHeader webData={formData}/>
          <TheHeader webData={formData}/>
          <HomeContent webData={formData}/>
          <About webData={formData}/>
          <ContactUs webData={formData}/>
          <Catalogue webData={formData}/>
          <TheFooter webData={formData}/>
        </div>
      </div>

  );
};

export default Home;
