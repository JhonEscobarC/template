import {console} from "next/dist/compiled/@edge-runtime/primitives";

export async function POST(req) {
    try {
        console.log("Init deploy POST");
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);
        const business = body.name.replace(/\s+/g, '-').toLowerCase()
        console.log(business, "🚀 Deploying...");
        // Crear el despliegue
        const deploymentResponse = await fetch("https://api.vercel.com/v13/deployments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
            },
            body: JSON.stringify({
                name: business,
                gitSource: {
                    type: "github",
                    repo: "JhonEscobarC/template",
                    ref: "main",
                    repoId: 937195248,
                },
                projectSettings: {
                    framework: "nextjs",
                    buildCommand: "prisma generate && next build",
                }
            }),
        });
        console.log("🚀 Deployed");
        const deploymentData = await deploymentResponse.json();
        const projectId = deploymentData.projectId; // Obtener el ID del proyecto desplegado
        // Configurar variables de entorno
        const envVars = [
            { key: "NEXT_PUBLIC_WEB_ID", value: `${body.id}`, type: "encrypted", target: ["production"] }, // Aplicar en producción
            { key: "DATABASE_URL", value: process.env.DATABASE_URL, type: "encrypted", target: ["production"] },
            { key: "BUCKET_NAME", value: process.env.BUCKET_NAME, type: "encrypted", target: ["production"] },
            { key: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID, type: "encrypted", target: ["production"] },
            { key: "AWS_SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY, type: "encrypted", target: ["production"] },
            { key: "AWS_REGION", value: process.env.AWS_REGION, type: "encrypted", target: ["production"] },
        ];

        for (const envVar of envVars) {
            const envResponse = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
                },
                body: JSON.stringify(envVar),
            });

            if (!envResponse.ok) {
                console.error(`Error configurando variable ${envVar.key}:`, await envResponse.text());
            } else {
                console.log(`✅ Variable ${envVar.key} configurada correctamente.`);
            }
        }
        const redeployResponse = await fetch("https://api.vercel.com/v13/deployments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
            },
            body: JSON.stringify({
                name: business,
                project: projectId,
                target: 'production',
                gitSource: {
                    type: "github",
                    repo: "JhonEscobarC/template",
                    ref: "main",
                    repoId: 937195248,
                },
                projectSettings: {
                    framework: "nextjs",
                    buildCommand: "prisma generate && next build",
                }
            })
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return new Response(JSON.stringify({ error: "Error fetching data", success: false }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }
}