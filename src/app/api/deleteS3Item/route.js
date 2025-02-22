import AWS from "aws-sdk";

export async function POST(req) {
    try {
        console.log("Init deleteS3Item");

        const { fileUrl } = await req.json();
        if (!fileUrl) {
            return new Response(JSON.stringify({ success: false, message: "No file URL provided" }), { status: 400 });
        }

        const extractKeyFromUrl = (url) => {
            const urlObj = new URL(url);
            return urlObj.pathname.substring(1); // Elimina el "/" inicial
        };

        const key = extractKeyFromUrl(fileUrl); // "carpeta/imagen.jpg"

        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });

        const deleteFileFromS3 = async (key) => {
            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: key,
            };

            await s3.deleteObject(params).promise();

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
            });
        };

        return await deleteFileFromS3(key);
    } catch (error) {
        console.error("❌ Error en la eliminación:", error);
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            status: 500,
        });
    }
}
