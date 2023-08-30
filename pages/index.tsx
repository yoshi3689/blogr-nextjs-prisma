"use client";
import React, { useState } from "react";
import { GetStaticProps } from "next";

import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  return {
    props: { feed },
    revalidate: 10,
  };
};

type Props = {
  feed: PostProps[];
};

const Blog: React.FC<Props> = (props) => {
  const [file, setFile] = useState<File>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!file) return;

  try {
    const data = new FormData();
    data.set("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });
    // handle the error
    if (!res.ok) throw new Error(await res.text());
  } catch (e: any) {
    // Handle errors here
    console.error(e);
  }
  };
  
  return (
    <Layout>
      <div className="page">
        <h1>Public Feed</h1>
        <main>
          {process.env.NODE_ENV === "production" &&
            props.feed.map((post) => (
              <div key={post.id} className="post">
                <Post post={post} />
              </div>
            ))}
          <form onSubmit={onSubmit}>
            <input
              type="file"
              name="file"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
            <input type="submit" value="Upload" />
          </form>
        </main>
      </div>
      <style jsx>{`
        .post {
          background: white;
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  );
};

export default Blog;
