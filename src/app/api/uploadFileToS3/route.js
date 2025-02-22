import AWS from "aws-sdk";
import {console} from "next/dist/compiled/@edge-runtime/primitives";

export async function POST(req) {
   try {
        console.log("Init uploadFileToS3");
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) return new Response(JSON.stringify({ success: false, message: "No file provided" }), { status: 400 });
        const fileName = `${Date.now()}_${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);


        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION,
         });
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: fileName, // Nombre único
          ContentType: file.type,
          Body: buffer, // Enviar como Buffer
          ACL: "public-read",
         };

        const uploadToS3 = async () => {
           const data = await s3.upload(params).promise();
              return data.Location;
         };

       const imageUrl = await uploadToS3();

       return new Response(JSON.stringify({ success: true, url: imageUrl}), {
          status: 200,
          headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type"
          },});

       } catch (error) {
          console.error("❌ Error en la subida:", error);
          return new Response(JSON.stringify({ success: false, message: error.message }), {
              status: 500,
          });
       }
}
