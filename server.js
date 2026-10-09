import express from "express";
import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import * as deepl from "deepl-node";
import fs from "node:fs/promises";
import path from "node:path";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

// Dynamically generate links to any results-pages that may exist.
app.get("/pages", async (req, res) => {
    const resultsDir = "./public/results";
    const files = await fs.readdir(resultsDir);
    console.log(files);
    res.json(JSON.stringify(files));
});

app.post("/translate", async (req, res) => {
  console.log(req.body);

  await translateArray();
  await translateHtml();

  // Test creating a new translated html page
/*   const name = "test.html";
  const fileCreated = await createFile(name, req.body.html);
  fileCreated ? res.json({ fileName: name }) : res.json({ fileName: null }); */
});

async function translateArray(){
    
}

async function createFile(name, html) {
  const content = `
        <!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://du11hjcvx0uqb.cloudfront.net/dist/brandable_css/a9ac9f64818cf024e5d9ca1d5ae833b5/variables-9dec371ad57e3dd0396f0b2eddb63479.css">
    <link rel="stylesheet" href="https://cdn.smartdesigner.visiarc.com/dist/clbal3q8s0025wq50r2t1fxha/variables.css">
    <link rel="stylesheet" href="https://du11hjcvx0uqb.cloudfront.net/dist/brandable_css/new_styles_normal_contrast/bundles/common-701cbe13bb.css">
    <link
      rel="stylesheet"
      href="https://d37iccs1g8grfy.cloudfront.net/dist/output.css"
    />
    <title>DeepL test</title>
  </head>
  <body style="margin: 1rem;">
  ${html}
  </body>
</html>`;

  try {
    await fs.writeFile(`./public/results/${name}`, content);
    return true;
  } catch (err) {
    console.error("Unable to write file", err);
    return false;
  }
}

app.listen(port, () => {
  console.log(`Server running on ${port}.`);
});
