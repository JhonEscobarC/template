// src/app/api/verifyPassword.js
import prisma from "@/lib/prisma";
import {console} from "next/dist/compiled/@edge-runtime/primitives";


export async function POST(req) {
    try {
        console.log("Init createWeb POST")
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);
        console.log(body)
        const newWeb = await prisma.webs.create({
            data: {
                owner_id: body.owner.id, // ID del dueño
                color1: body.color1,
                color2: body.color2,
                color3: body.color3,
                link1: body.link1,
                link2: body.link2,
                link3: body.link3,
                developer: body.developer
            },
            select: { id: true } // Solo devolver el ID
        });

        console.log("🌐 Web creada con ID:", newWeb.id);
        const pageId = newWeb.id
        await prisma.header.create({
            data: {
                pagina: pageId,
                logo: body.header.logo,
            }
        });
        console.log("Header creado")
        await prisma.home.create({
            data: {
                pagina: pageId,
                titulo: body.home.titulo,
                imagen: body.home.imagen
            }
        });
        console.log("home creado")
        await prisma.about_us.create({
            data: {
                pagina: pageId,
                titulo: body.about_us.titulo,
                texto: body.about_us.texto,
                imagen: body.about_us.imagen
            }
        });
        console.log("about_us creado")
        await prisma.catalogo.create({
            data: {
                pagina: pageId,
                texto: body.catalogo.texto,
                titulo: body.catalogo.titulo,
                imagen: body.catalogo.imagen
            }
        });
        console.log("catologo creado")
        await prisma.contact_us.create({
            data: {
                pagina: pageId,
                texto: body.contact_us.texto,
                link: body.contact_us.link,
                imagen: body.contact_us.imagen
            }
        });
        console.log("contact_us creado")
        await prisma.footer.create({
            data: {
                pagina: pageId,
                logo: body.footer.logo,
                slogan: body.footer.slogan,
                correo: body.footer.correo,
                numero: body.footer.numero
            }
        });
        console.log("footer creado")
        return new Response(JSON.stringify({ success: true, id: pageId }), { status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },});
    } catch (error) {
        console.error("❌ Error en la creación de la web:", error);
        return new Response(JSON.stringify({ error: "JSON inválido" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}
