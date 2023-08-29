import React from "react";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";

import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from "../lib/prisma";

import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]"

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  // in getServerSideProps, has to run the server session function
  // with the auth options object to fetch an existing session
  const session = await getServerSession(req, res, authOptions);
  console.log(session);
  if (!session) {
    res.statusCode = 403;
    return { props: { drafts: [] } };
  }

  const drafts = await prisma.post.findMany({
    where: {
      author: { email: session.user.email },
      published: false,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  return {
    props: { drafts },
  };
};

type Props = {
  drafts: PostProps[];
};

const Drafts: React.FC<Props> = (props) => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Layout>
        <h1>My Drafts</h1>
        <div>You need to be authenticated to view this page.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <h1>My Drafts</h1>
        <main>
          {props.drafts.length === 0
            ? (
              <div>No drafts posted</div>
            )
            : props.drafts.map((post) => (
            <div key={post.id} className="post">
              <Post post={post} />
            </div>
          ))
          }
        </main>
      </div>
      <style jsx>{`
        .post {
          background: var(--geist-background);
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

export default Drafts;
