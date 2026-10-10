import express from "express";
import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import * as deepl from "deepl-node";
import fs from "node:fs/promises";

dotenv.config();

const app = express();
const port = process.env.PORT;
const API_KEY = process.env.API_KEY || "";


const deeplClient = new deepl.DeepLClient(API_KEY);

const TRANSLATION_RESULTS = {
  "billedArray": {
    "text": 0,
    "empty": 0,
    "total": 0,
  },
  "billedHtml": 0,
};

app.use(express.json());
app.use(express.static("public"));

// Dynamically generate links to any results-pages that may exist.
app.get("/pages", async (req, res) => {
  const resultsDir = "./public/results";
  const files = await fs.readdir(resultsDir);
  res.json(JSON.stringify(files));
});

app.post("/translate", async (req, res) => {
  const body = req.body.html;
  //const body = "<div><h1>Hallo Verden</h1><p>Hvordan går det?</p><p>   </p></div>";
  const filesCreated = [];

  // Translate with array of extracted text
  const arrayTranslated = await translateArray(body);
  const arrayFile = await createFile("array_translation.html", arrayTranslated);
  if (arrayFile) {
    filesCreated.push(arrayFile);
  }

  // Translate entire html directly
  const htmlTranslated = await translateHtml(body);
  const htmlFile = await createFile("html_translation.html", htmlTranslated);
  if (htmlFile) {
    filesCreated.push(htmlFile);
  }

  // Create a summary page
  const summaryHtml = `
    <h1>Oppsummering</h1>
    <p>Her ser du en oppsummering på antall tegn som er brukt for de ulike oversettelsene. Antall brukte tegn er tegn det blir tatt betalt for.</p>
    <p>Antall tegn brukt på oversettelse hvor vi trekker ut tekst: ${TRANSLATION_RESULTS.billedArray.total}.</p>
    <p>Av tegnene brukt på uttrekk er ${TRANSLATION_RESULTS.billedArray.empty} brukt på tomme elementer, og ${TRANSLATION_RESULTS.billedArray.text} er brukt på faktisk tekst.</p>
    <p>Antall tegn brukt på oversettelse av html direkte: ${TRANSLATION_RESULTS.billedHtml}</p>
  `;
  const summaryFile = await createFile("summary.html", summaryHtml);
  if(summaryFile){
    filesCreated.push(summaryFile);
  }


  res.json(filesCreated);

  // Test creating a new translated html page
  /*   const name = "test.html";
  const fileCreated = await createFile(name, req.body.html);
  fileCreated ? res.json({ fileName: name }) : res.json({ fileName: null }); */
});

async function translateArray(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const textNodes = [];
  const walker = doc.createTreeWalker(
    doc.body,
    dom.window.NodeFilter.SHOW_TEXT,
  );

  let node;

  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  /* TODO
  * Check to see if removing nodes with empty spaces (line breaks, tabs, spaces) affects cost
   */
  const textToTranslate = textNodes.map((node) => node.nodeValue);
  /* TRANSLATE ARRAY 
  ----------------- */

  // Mock translation:
  /* let translatedText = [];
  for (const text of textToTranslate) {
    translatedText.push("lorem");
  } */

    const translation = await deeplClient.translateText(textToTranslate, "NB", "EN-GB", {modelType: "prefer_quality_optimized"});
    console.log(translation);
  /*-----------------
  */

  // Replace translated text in each node
  textNodes.forEach((node, index) => {
    node.nodeValue = translation[index].text;
    if(/^[\\n\\t\s]*$/.test(translation[index].text)){
      TRANSLATION_RESULTS.billedArray.empty += translation[index].billedCharacters;
    } else {
      TRANSLATION_RESULTS.billedArray.text += translation[index].billedCharacters;
    }
    TRANSLATION_RESULTS.billedArray.total += translation[index].billedCharacters;
  });

  return dom.serialize();
}

async function translateHtml(html) {

  /* TRANSLATE HTML 
----------------- */

  const translation = await deeplClient.translateText(html, "NB", "EN-GB", {
    modelType: "prefer_quality_optimized",
    tagHandling: "html",
    tagHandlingVersion: "v2",
  });

  /*-----------------
  */

  TRANSLATION_RESULTS.billedHtml += translation.billedCharacters;

  return translation.text;
}

async function createFile(name, html) {
  const resultsDir = "./public/results";
  // See if file exists
  const files = await fs.readdir(resultsDir);

  // If file exists, add an index to the end
  let index = 1;
  while(files.includes(name)){
    name = name.slice(0,-5) + "_" + index + ".html";
    index += 1;
  }

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
    await fs.writeFile(`${resultsDir}/${name}`, content);
    return name;
  } catch (err) {
    console.error("Unable to write file", err);
  }
}

app.listen(port, () => {
  console.log(`Server running on ${port}.`);
});
