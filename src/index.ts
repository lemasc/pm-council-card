import core, { Page } from "puppeteer";
import path from "path";
import { createIfNotExist, createOrOverWriteFolder } from "./utils";

export {};

const capturePage = async (page: Page, filename: string) => {
  await page.waitForNetworkIdle({
    idleTime: 750,
  });
  createIfNotExist(
    "generated_posts/" + filename.slice(0, filename.indexOf("/"))
  );
  // Screenshot the image to PNG file
  await page.screenshot({
    path: path.join(process.cwd(), "generated_posts", filename),
    type: "png",
    clip: {
      x: 0,
      y: 0,
      width: 2048,
      height: 2048,
    },
  });
};

async function main() {
  console.log("Starting....");
  const browser = await core.launch({
    headless: true,
    args: [],
    defaultViewport: {
      width: 2368,
      height: 2048,
    },
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/posts");
  await createOrOverWriteFolder("generated_posts");
  for (let i = 0; i < 30; i++) {
    const filename = (await page.evaluate(
      () => (document.querySelector("#filename") as any).innerText
    )) as string;
    console.log(`Processing file ${i + 1}:`, filename);
    await capturePage(page, filename);
    await page.click("#next");
  }
  await browser.close();
}

main().catch(console.error);
