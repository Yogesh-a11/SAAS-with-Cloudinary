"use client";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadStream } from 'cloudinary';
import { auth } from "@clerk/nextjs/server";
import { error } from "console";

cloudinary.config({
    Cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    API_key	: process.env.CLOUDINARY_API_KEY,
    API_secret: process.env.CLOUDINARY_API_SECRET
})

interface CloudinaryUploadResult {
    public_id: string;
    [key: string]: any;
}

export async function POST(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json("Unauthorized", { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({error: "No file uploaded"}, { status: 400 });
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "next-cloudinary-example" },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result as CloudinaryUploadResult);
                        }
                    }
                )
                uploadStream.end(buffer);
            }
        )
        return NextResponse.json(
            {publicId: result.public_id},
            {status: 200}
        )

    } catch (error) {
        console.log(error, "Upload image failed");
        return NextResponse.json({error: "Failed to upload image"}, {status: 500})
    }
}