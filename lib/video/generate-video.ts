import puppeteer from 'puppeteer-core';
import path from 'path'
import { GenerateVideoOptions } from './types';

const RECORDINGS_DIR = path.join(process.cwd(), "recordings");

const DefaultGenerateVideoOptions: GenerateVideoOptions = {
  jobId: null,
  videoFormat: "mp4",
  viewport: {
    width: 1600,
    height: 900,
  }
}

export async function generateVideo(
  url: string | URL,
  options: GenerateVideoOptions
) {
  if (!(url instanceof URL) && typeof url !== "string") {
    throw new Error("URL should be of type 'string' or 'URL'");
  }
  if (url instanceof URL) {
    url = url.toString();
  }

  // Launch the browser and open a new blank page.
  const browser = await puppeteer.launch({
    channel: "chrome"
  });
  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(url);

  // Set the screen size.
  await page.setViewport(options.viewport ?? DefaultGenerateVideoOptions.viewport);

  await new Promise(r => setTimeout(r, 3000));

  const screencastPath = path.join(
    RECORDINGS_DIR,
    `screencast-${options.jobId}.${options.videoFormat}`
  ) as `${string}.${"webm" | "mp4" | "gif"}`;

  const recorder = await page.screencast({
    path: screencastPath
  });

  await page.evaluate(async () => {
    for (let i = 0; i < 3000; i += 10) {
      window.scrollTo(0, i);
      await new Promise(r => setTimeout(r, 16));
    }
  });

  await new Promise(r => setTimeout(r, 5000));

  await recorder.stop();
  await browser.close();

  return { screencastPath };
}
