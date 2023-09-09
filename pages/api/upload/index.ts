import { S3Client, PutObjectCommand, GetObjectCommand, PutObjectCommandOutput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server";
// import { NextAPIRequest, NextAPIResponse } from "next/server";

// the below config is necessary to make req.formData() work
export const config = {
  runtime: "edge"
};

export type UploadResult = {
  uploadResult: PutObjectCommandOutput,
  success: boolean,
  presignedUrl: string
};

const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(request: NextRequest) {
  const form = await request.formData();
  const file: File | null = (form.get('file') as unknown as File);

  const putCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: file.name,
    // need to convert a file to an array buffer
    // then convert it to a Buffer object
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    ACL: "public-read",
  });

  try {
    // aws es3
    // put an object
    const uploadResult = await s3.send(putCommand);
    console.log(uploadResult);

    // get a presignedUrl of the object uploaded
    const getCommand = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: file.name,
    });
    const presignedUrl: string =
      await getSignedUrl(s3, getCommand, { expiresIn: 3600 });
    const result : UploadResult = { success: true, uploadResult, presignedUrl };
    return NextResponse.json(
      result, { status: 200 }
    );

  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: err }, {
      status: 405
    });
  }
}
