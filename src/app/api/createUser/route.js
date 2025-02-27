// src/app/api/verifyPassword.js

import prisma from "@/lib/prisma";
import {console} from "next/dist/compiled/@edge-runtime/primitives";

export async function GET() {
    try {
        const test = await prisma.personal_data.findMany({ take: 1 });
        return new Response(JSON.stringify({ success: true, data: test }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}

export async function POST(req) {
    try {
        console.log("Init createUser POST")
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);
        const userData = {
            name: body.name,
            business: body.business,
            id_number: body.id_number,
        };
        const newUser = await prisma.personal_data.create({
            data: userData,
            select: { id: true }
        });

        return new Response(JSON.stringify({ success: true, id: newUser.id}), { status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },});
    } catch (error) {
        return new Response(JSON.stringify({ error: "JSON inválido" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}
