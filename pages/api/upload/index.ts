import { writeFile } from "fs/promises";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
// import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const readFile = (req: NextApiRequest, saveLocally?: boolean)
  : Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const options: formidable.Options = {};
  // fill options object if uploading locally
  if (saveLocally) {
    options.uploadDir = path.join(process.cwd(), "public/images")
    options.filename = (name, ext, path, form) => {
      return Date.now().toString() + "_" + path.originalFilename;
    }
  }

  const form = formidable(options);
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({fields, files})
    })
  })
  

  
}

const handler: NextApiHandler = async (req, res) => {
  try {
    await fs.readdir(path.join(process.cwd() + "/public", "/images"))
  } catch (err) {
    await fs.mkdir(path.join(process.cwd() + "/public", "/images"))
  }
  await readFile(req, true);
  res.json({ success: true });
}

export default handler;

// const file: File | null = data.get("file") as unknown as File;

//   if (!file) {
//     return res.json({ success: false });
//   }

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   // With the file data in the buffer, you can do whatever you want with it.
//   // For this, we'll just write it to the filesystem in a new location
//   const path = `/tmp/${file.name}`;
//   await writeFile(path, buffer);
//   console.log(`open ${path} to see the uploaded file`);

//   return res.json({ success: true });
