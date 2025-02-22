"use client";
import AWS from 'aws-sdk';
import {useEffect, useRef, useState} from "react";
import TheHeader from "@/app/components/header";
import HomeContent from "@/app/components/homeContent";
import PreHeader from "@/app/components/preHeader";
import About from "@/app/components/about";
import ContactUs from "@/app/components/contactUs";
import Catalogue from "@/app/components/catalogue";
import Members from "@/app/components/members";
import TheFooter from "@/app/components/footer";

const EditForm = () => {
    const id = Number(process.env.NEXT_PUBLIC_WEB_ID)
    const [globalFile, setFile] = useState(null);
    const [webData, setWebData] = useState(null);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
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
                    ...data,
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

    const uploadFileToS3 = async (file, e) => {
        const blob = new Blob([file], { type: file.type });
        const formData = new FormData();
        formData.append("file", blob, file.name); // Asegúrate de incluir el nombre del archivo

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
    const deleteS3Item = async (fileUrl, e) => {
        e.preventDefault();
        const res = await fetch("/api/deleteS3Item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileUrl }),
        });
        const data = await res.json();

        if (data.success) {
           return console.log(`Archivo eliminado de S3`);
        }
        return console.error("Error al eliminar archivo de S3");
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
                    const url = await uploadFileToS3(file, e);
                    updateNestedProperty(updatedFormData, campo, url);
                   await deleteS3Item(valor, e); // Eliminar el archivo viejo de S3

                } catch (error) {
                    console.error("Error al subir archivo:", error);
                    alert("Error al subir archivo. Intenta de nuevo.");
                    return false; // Devolver false si ocurre un error
                }
        }

        // Si todo va bien, actualizar formData con los nuevos datos
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
    const handleSave = async (e) => {
        try {
            // Validar que formData no esté vacío
            if (!formData || Object.keys(formData).length === 0) {
                alert("No hay datos para guardar.");
                return;
            }
            await processFilesAndUpdateFormData(e)

            e.preventDefault();
            const res = await fetch("/api/updateWeb", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                alert("Datos guardados correctamente");
            } else {
                alert("Error al guardar: " + ("Respuesta inesperada"));
            }
            window.location.href = '/';

        } catch (error) {
            console.error("❌ Error guardando datos:", error.stack || error);
            if (error.name === "AbortError") {
                alert("La solicitud tardó demasiado. Por favor, intenta de nuevo.");
            } else {
                alert("Error al guardar: " + (error.message || "Error desconocido"));
            }
        }
    };


    if (loading) return <div>🔄 Cargando datos...</div>;
    if (!webData) return <div>❌ No se encontraron datos.</div>;
    return (
        <div className="flex gap-4 p-4 h-screen ">
            {/* Formulario de edición */}
            <div className="w-1/3 h-full overflow-auto p-4 border rounded-lg shadow-md items-center">
                <h2 className="text-xl font-bold mb-4">Editar Página</h2>
                <button
                    onClick={() => window.location.href = '/'} // Cambia esto según la ruta de tu inicio
                    className="absolute z-[1000] top-5 right-5 bg-red-500 text-white px-3 py-2 rounded-lg shadow-md
                   hover:bg-red-600 hover:shadow-lg active:bg-red-700 active:scale-95 transition-all duration-200"
                >
                    ⬅️ Volver al inicio
                </button>
                <form className="space-y-4">
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
                                <label className="block font-medium">Link 1:</label>
                                <input
                                    type="text"
                                    name="link1"
                                    placeholder={webData.link1}
                                    onChange={handleChange}
                                    className="border p-2 w-full rounded"
                                />
                            </div>

                            <div className="p-4 border rounded-lg shadow-md">
                                <label className="block font-medium">Link 2:</label>
                                <input
                                    type="text"
                                    name="link2"
                                    placeholder={webData.link2}
                                    onChange={handleChange}
                                    className="border p-2 w-full rounded"
                                />
                            </div>

                            <div className="p-4 border rounded-lg shadow-md">
                                <label className="block font-medium">Link 3:</label>
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

                    {/* Miembros */}
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2">👥 Miembros</h2>
                        <hr className="mb-4 border-gray-300"/>
                        <div className="grid gap-4">
                            <div className="p-4 border rounded-lg shadow-md">
                                <label className="block font-medium">Título Miembros:</label>
                                <input type="text" name="members.titulo" placeholder={webData.members.titulo}
                                       onChange={handleChange} className="border p-2 w-full rounded"/>
                            </div>
                            <div className="p-4 border rounded-lg shadow-md">
                                <label className="block font-medium">Texto Miembros:</label>
                                <textarea name="members.texto" placeholder={webData.members.texto}
                                          onChange={handleChange} className="border p-2 w-full rounded"/>
                            </div>
                            <div className="p-4 border rounded-lg shadow-md">
                                <label className="block font-medium">Imagen Miembros:</label>
                                <input type="file" accept="image/png, image/jpeg" name="members.imagen"
                                       placeholder={webData.members.imagen} onChange={handleChange}
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

                    {/* Footer */}
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2">🔽 Footer</h2>
                        <hr className="mb-4 border-gray-300"/>

                        <div className="grid gap-4">
                            <div className="p-4 border rounded-lg shadow-md">
                                <label className="block font-medium">Logo Footer:</label>
                                <input type="text" name="footer.logo" placeholder={webData.footer.logo}
                                       onChange={handleChange} className="border p-2 w-full rounded"/>
                            </div>

                            <div className="p-4 border rounded-lg shadow-md">
                                <label className="block font-medium">Slogan Footer:</label>
                                <input type="text" name="footer.slogan" placeholder={webData.footer.slogan}
                                       onChange={handleChange} className="border p-2 w-full rounded"/>
                            </div>

                            <div className="p-4 border rounded-lg shadow-md">
                                <label className="block font-medium">Correo Footer:</label>
                                <input type="text" name="footer.correo" placeholder={webData.footer.correo}
                                       onChange={handleChange} className="border p-2 w-full rounded"/>
                            </div>

                            <div className="p-4 border rounded-lg shadow-md">
                                <label className="block font-medium">Número Footer:</label>
                                <input type="text" name="footer.numero" placeholder={webData.footer.numero}
                                       onChange={handleChange} className="border p-2 w-full rounded"/>
                            </div>

                        </div>
                    </div>


                    <button
                        onClick={handleSave}
                        className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg shadow-md
               hover:bg-blue-700 hover:shadow-lg
               active:bg-blue-800 active:scale-95
               transition-all duration-200"
                    >
                        Guardar Cambios
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
                <Members webData={formData}/>
                <TheFooter webData={formData}/>
            </div>
        </div>

    );
};

export default EditForm;
