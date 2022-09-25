/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import data from "../data.json";
import { fetchImage } from "../lib/fetch";
import { maxValue, percentToStep, stepToPercent } from "../lib/step";
import { Source } from "../lib/types";

const sources = data as Source[];

export default function Home() {
  const [index, setIndex] = useState(0);
  const dataRef = useRef<Map<number, number>>();
  const imageRef = useRef<HTMLImageElement | null>();
  const sliderRef = useRef<HTMLInputElement | null>();

  useEffect(() => {
    (async () => {
      // Restore from browser first
      let config = localStorage.getItem("council-card");
      if (!config) {
        try {
          const remote = await axios.get("/config.json", {
            responseType: "json",
            transformResponse: (res) => res,
          });
          config = remote.data;
        } catch {}
      }
      if (config) {
        dataRef.current = new Map(JSON.parse(config));
        return;
      } else {
        dataRef.current = new Map();
      }
    })();
  }, []);

  useEffect(() => {
    console.log(index);
    if (imageRef.current?.src) {
      window.URL.revokeObjectURL(imageRef.current.src);
      imageRef.current.style.display = "none";
    }
    (async () => {
      try {
        const image = await fetchImage(sources[index]);
        imageRef.current.src = window.URL.createObjectURL(image.data);
        imageRef.current.style.display = "block";
      } catch (err) {
        console.error(err);
      } finally {
        const defaultStep =
          (dataRef.current && dataRef.current.get(index)) ?? maxValue / 2;
        imageRef.current.style.objectPosition = `50% ${stepToPercent(
          defaultStep
        )}%`;
        sliderRef.current.value = defaultStep.toString();
      }
    })();
  }, [index]);

  const saveData = () => {
    if (!dataRef.current) return;
    if (
      imageRef.current &&
      imageRef.current.style.objectPosition !== "50% 50%"
    ) {
      dataRef.current.set(
        index,
        percentToStep(imageRef.current.style.objectPosition.split(" ")[1])
      );
    } else {
      dataRef.current.delete(index);
    }
    localStorage.setItem(
      "council-card",
      JSON.stringify(Array.from(dataRef.current.entries()))
    );
  };

  const reset = () => {
    imageRef.current.style.objectPosition = "50% 50%";
    sliderRef.current.value = (maxValue / 2).toString();
    saveData();
  };

  const saveToServer = async () => {
    try {
      await axios.post("/api/save", {
        payload: Array.from(dataRef.current.entries()),
      });
      localStorage.removeItem("council-card");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Head>
        <title>บัตรกรรมการนักเรียน</title>
      </Head>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <main
          style={{
            width: "1050px",
            height: "1500px",
            position: "relative",
            background: "lightgray",
          }}
        >
          <Image
            src={`/frames/${sources[index].role}/${sources[index].section}.PNG`}
            width={1050}
            height={1500}
            unoptimized
            alt="Frame"
            style={{ zIndex: "2" }}
          />
          <div style={{ position: "absolute", top: "200px" }}>
            <img
              ref={(ref) => (imageRef.current = ref)}
              width={1050}
              height={1050}
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "185px",
              zIndex: 10,
              color: "white",
              width: "100%",
              fontSize: "55px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {sources[index]?.nametitle}
            {sources[index]?.name} {sources[index]?.surname}
          </div>
        </main>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "2rem",
            gap: "1rem",
            width: "250px",
            fontSize: "2rem",
          }}
        >
          <button
            id="previous"
            onClick={() => {
              saveData();
              setIndex((i) => {
                return i === 0 ? i : --i;
              });
            }}
          >
            Previous
          </button>
          <button
            id="next"
            onClick={() => {
              saveData();
              setIndex((i) => {
                return i < sources.length - 1 ? ++i : i;
              });
            }}
          >
            Next
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              paddingBlock: "2em",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <input
              type="range"
              step="5"
              max={maxValue}
              ref={(ref) => (sliderRef.current = ref)}
              min="0"
              onChange={(e) => {
                if (imageRef.current) {
                  const height = parseFloat(e.target.value);
                  imageRef.current.style.objectPosition = `50% ${stepToPercent(
                    height
                  )}%`;
                }
              }}
            />
            <button style={{ width: "100%" }} onClick={() => reset()}>
              Reset
            </button>{" "}
            <button style={{ width: "100%" }} onClick={() => saveToServer()}>
              Save
            </button>
          </div>
        </div>
      </div>
      <span id="filename" style={{ display: "none" }}>
        {data[index].section}/{data[index].name}.png
      </span>
    </div>
  );
}
