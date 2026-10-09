import express from "express";
import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import * as deepl from "deepl-node";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

app.listen(port, ()=>{
    console.log(`Server running on ${port}.`);;
});