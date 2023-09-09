import React, { useRef, useState } from "react";
import { GetStaticProps } from "next";

import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from "../lib/prisma";
import { UploadResult } from "./api/upload";
import { Box, Button, Container, IconButton, Link, Paper, Typography } from "@mui/material";
import { DriveFolderUpload, LastPage, SpaceBar, UploadFile } from "@mui/icons-material";



export const getStaticProps: GetStaticProps = async () => {
  const feed =
    process.env.NODE_ENV === "production" ?
    (await prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: { name: true },
        },
      },
    }))
    : 
    "no posts"
    ;
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
  const [image, setImage] = useState<string>();
  const [presignedUrl, setPresignedUrl] = useState<string>();

  const imageRef = useRef(null);

  // Accept only image file type (.jpg or .jpeg)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0]);
    setImage(URL.createObjectURL(e.target.files?.[0]));
  };

  const removeFile = () => {
    setFile(null);
    setImage(null);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!file) return;

  try {
    const data = new FormData();
    data.set("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });

    // handle the error if there is
    if (!res.ok) throw new Error(await res.text());

    const { uploadResult, success, presignedUrl }: UploadResult = await res.json();
    console.log(uploadResult)
    setPresignedUrl(presignedUrl);
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
          {process.env.NODE_ENV === "production" ? (
            props.feed.map((post) => (
              <div key={post.id} className="post">
                <Post post={post} />
              </div>
            ))
          ) : (
            <div>nothing to show</div>
          )}
          <Paper
          // sx={{
          //   p: 2,
          //   display: "flex",
          //   flexDirection: "column",
          //   height: 240,
          // }}
          >
            <Container>
              <SpaceBar />
              <Box component="div" sx={{ border: "1px dashed grey" }}>
                <Typography py={4} align="center" variant="h4" component="h2">
                  {file ? file.name : "File Name"}
                </Typography>
                {image && (
                  <img
                    src={image}
                    className="App-logo"
                    alt="logo"
                    ref={imageRef}
                  />
                )}
              </Box>
              <Box component="label" htmlFor="file">
                <IconButton color="inherit">
                  <DriveFolderUpload />
                  <Typography
                    mx={1}
                    htmlFor="file"
                    component="label"
                    variant="h6"
                    color="inherit"
                    noWrap
                  >
                    Select File
                  </Typography>
                </IconButton>
              </Box>
              {file && (
                <>
                  <Box component="label" alignSelf="end" htmlFor="upload">
                    <IconButton color="inherit">
                      <UploadFile />
                      <Typography
                        mx={1}
                        component="h3"
                        variant="h6"
                        color="inherit"
                        noWrap
                      >
                        Upload
                      </Typography>
                    </IconButton>
                  </Box>
                  <Box component="label" alignSelf="end">
                    <IconButton color="inherit" onClick={removeFile}>
                      <UploadFile />
                      <Typography
                        mx={1}
                        component="h3"
                        variant="h6"
                        color="inherit"
                        noWrap
                      >
                        Remove file
                      </Typography>
                    </IconButton>
                  </Box>
                </>
              )}
              {presignedUrl && (
                <Typography component="span" variant="h6">
                  <Link
                    color="primary"
                    href={presignedUrl}
                    onClick={(event: React.MouseEvent) =>
                      event.preventDefault()
                    }
                  >
                    View File
                  </Link>
                  <LastPage />
                </Typography>
              )}

              <form onSubmit={handleSubmit}>
                <input
                  type="file"
                  hidden
                  id="file"
                  name="file"
                  onChange={handleChange}
                />
                <input
                  hidden
                  type="submit"
                  id="upload"
                  name="upload"
                  value="Upload"
                />
              </form>
            </Container>
          </Paper>
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
