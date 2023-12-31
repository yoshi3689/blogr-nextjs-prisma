import { getServerSession } from 'next-auth/next';
import prisma from '../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from "next";

import { authOptions } from '../auth/[...nextauth]';

// POST /api/post
// Required fields in body: title
// Optional fields in body: content

// where is this function exported to??
// I'm assuming it is exported to an api server (next.js built-in express server?)
export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  const { title, content } = req.body;

  const session = await getServerSession(req, res, authOptions);
  const result = await prisma.post.create({
    data: {
      title: title,
      content: content,
      author: { connect: { email: session?.user?.email } },
    },
  });
  res.json(result);
}