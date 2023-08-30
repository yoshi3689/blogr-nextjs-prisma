import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import Layout from "../../components/Layout"
import { DraftProps, PostProps } from "../../components/Post"
import prisma from "../../lib/prisma"
import Router from "next/router"
import { useSession } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import { AppProps } from "next/app"

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  // using the value of id in params object containing query parameters, 
  // a post matching the id is fetched
  const post = await prisma.post.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  const session = await getServerSession(req, res, authOptions);
  
  return {
    props: {post, session},
  };
};

async function publishPost(id: string): Promise<void> {
  await fetch(`/api/publish/${id}`, {
    method: "PUT",
  });
  await Router.push("/");
}

const Post: React.FC<DraftProps> = (props) => {
  
  // if (status === "loading") {
  //   return <div>Authenticating ...</div>;
  // }
  // const userHasValidSession = Boolean(session);
  const postBelongsToUser = props.session?.user?.email === props.post.author?.email;
  let title = props.post.title;
  if (!props.post.published) {
    title = `${title} (Draft)`;
  }

  return (
    <Layout>
      <div>
        <h2>{title}</h2>
        <p>By {props?.post.author?.name || "Unknown author"}</p>
        <ReactMarkdown children={props.post.content} />
        {!props.post.published && props.session && postBelongsToUser && (
          <button onClick={() => publishPost(props.post.id)}>Publish</button>
        )}
      </div>
      <style jsx>{`
        .page {
          background: var(--geist-background);
          padding: 2rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default Post;