/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import {
  forwardRef,
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import data from "../data_posts.json";
import { fetchImage } from "../lib/fetch";
import { maxValue, percentToStep, stepToPercent } from "../lib/step";
import { Source } from "../lib/types";

const sources = data as Source[][];

const cachedUrls = [];

const WindowTitleHeight = 88;

function ImageBox({
  index,
  top,
  left,
  showName = true,
  section,
  setImageRef,
  data,
}: {
  index: number;
  top: number;
  left: number;
  showName?: boolean;
  section: number;
  setImageRef?: (element: HTMLImageElement | null) => void;
  data?: Map<number, number>;
}) {
  const imageRef = useRef<HTMLImageElement | null>();
  const [state, setState] = useState<{ url?: string; position: string }>({
    position: "50% 50%",
  });
  useEffect(() => {
    if (!data) return;
    (async () => {
      try {
        if (!cachedUrls[section]) {
          cachedUrls[section] = [];
        }
        let url = cachedUrls[section][index];
        if (!url && sources[section][index]) {
          const image = await fetchImage(sources[section][index]);
          url = window.URL.createObjectURL(image.data);
        }
        const defaultStep = (data && data.get(index)) ?? maxValue / 2;
        setState({ position: `50% ${stepToPercent(defaultStep)}%`, url: url });
      } catch (err) {
        console.error(err);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, index, data]);

  return (
    <>
      {showName && (
        <span
          style={{
            position: "absolute",
            top: `${top}px`,
            left: `${left}px`,
            height: `${WindowTitleHeight}px`,
            display: "flex",
            alignItems: "center",
            paddingLeft: "70px",
            paddingTop: "12px",
            zIndex: 2,
          }}
          onClick={() => setImageRef(imageRef.current)}
        >
          {sources[section][index]?.nametitle}
          {sources[section][index]?.name} {sources[section][index]?.surname}
        </span>
      )}
      <div
        style={{
          position: "absolute",
          top: `${top + WindowTitleHeight + 55}px`,
          left: `${left}px`,
        }}
      >
        <img
          ref={imageRef}
          src={state.url}
          width={930}
          height={545}
          style={{
            objectFit: "cover",
            objectPosition: state.position,
            display: state.url ? "block" : "none",
          }}
          id={index.toString()}
        />
      </div>
    </>
  );
}

const colors = Object.values({
  ฝ่ายกิจการนักเรียน: "#fee1be",
  ฝ่ายกีฬาและนันทนาการ: "#fedaac",
  ฝ่ายวิชาการ: "#c5d0da",
  ฝ่ายเทคโนโลยีสารสนเทศ: "#e1ccd3",
  ฝ่ายสิ่งแวดล้อม: "#e0f0bd",
});

export default function Posts() {
  const [section, setSection] = useState<number>(undefined);
  const [index, setIndex] = useState(0);
  const dataRef = useRef<Map<number, number>[]>();
  const imageRef = useRef<HTMLImageElement | null>();
  const sliderRef = useRef<HTMLInputElement | null>();

  useEffect(() => {
    (async () => {
      // Restore from browser first
      let config = localStorage.getItem("council-card");
      if (!config) {
        try {
          const remote = await axios.get("/config-posts.json", {
            responseType: "json",
            transformResponse: (res) => res,
          });
          config = remote.data;
        } catch {}
      }
      const parsed = JSON.parse(config);
      if (Array.isArray(parsed)) {
        dataRef.current = parsed.map((v) => new Map(v));
      } else {
        dataRef.current = Array(5).fill(new Map());
      }
      setSection(0);
    })();
  }, []);

  const saveData = () => {
    if (!dataRef.current) return;
    const index = parseInt(imageRef.current.id);
    if (
      imageRef.current &&
      imageRef.current.style.objectPosition !== "50% 50%"
    ) {
      dataRef.current?.[section].set(
        index,
        percentToStep(imageRef.current.style.objectPosition.split(" ")[1])
      );
    } else {
      dataRef.current?.[section].delete(index);
    }
    localStorage.setItem(
      "council-card",
      JSON.stringify(dataRef.current.map((v) => Array.from(v.entries())))
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
        payload: dataRef.current.map((v) => Array.from(v.entries())),
      });
      localStorage.removeItem("council-card");
    } catch (err) {
      console.error(err);
    }
  };

  const setImageRef = (element: HTMLImageElement) => {
    imageRef.current = element;
    sliderRef.current.value = percentToStep(
      element.style.objectPosition.split(" ")[1]
    ).toString();
  };

  const useEndPage = useMemo(
    () =>
      index + (section === 3 ? 1 : 0) >=
      Math.floor(sources[section ?? 0].length / 2),
    [index, section]
  );

  return (
    <div style={{ overflow: "hidden" }}>
      <Head>
        <title>โพสต์กรรมการนักเรียน</title>
      </Head>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <main
          style={{
            width: "2048px",
            height: "2048px",
            position: "relative",
            background: colors[section ?? 0],
            color: "white",
            fontFamily: "kor bau Med",
            fontSize: "40px",
          }}
        >
          <Image
            src={`/posts/${sources[section ?? 0][index].section}${
              useEndPage ? "_2" : ""
            }.PNG`}
            width={2048}
            height={2048}
            unoptimized
            alt="Frame"
            style={{ zIndex: "2" }}
          />
          <div
            style={{
              padding: "48px",
              justifyContent: "flex-end",
              alignItems: "center",
              display: "flex",
              position: "absolute",
              left: 1354,
              top: 0,
              width: 694,
              height: 420,
            }}
          >
            <Image
              src={index % 2 === 0 ? "/logo.png" : "/logo_wpm.png"}
              width={300}
              height={300}
            />
          </div>
          {section !== undefined && (
            <>
              <ImageBox
                top={205}
                left={232}
                data={dataRef.current?.[section]}
                index={index * 2}
                section={section}
                setImageRef={setImageRef}
              />

              <ImageBox
                top={1025}
                left={232}
                data={dataRef.current?.[section]}
                index={index * 2 + 1}
                section={section}
                setImageRef={setImageRef}
              />

              <ImageBox
                top={640}
                left={1354}
                data={dataRef.current?.[section]}
                index={index * 2 + 2}
                showName={false}
                section={section}
              />
              <ImageBox
                top={1465}
                left={1354}
                data={dataRef.current?.[section]}
                index={index * 2 + 3}
                showName={false}
                section={section}
              />
            </>
          )}
        </main>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "2rem",
            gap: "1rem",
            width: "250px",
            fontSize: "2rem",
            backgroundColor: "white",
            zIndex: "2",
          }}
        >
          <button
            id="previous"
            onClick={() => {
              if (index > 0) {
                setIndex(index - 1);
              } else if (section > 0) {
                setSection(section - 1);
                setIndex(Math.ceil(sources[section].length / 4));
              }
            }}
          >
            Previous
          </button>
          <button
            id="next"
            disabled={
              section === 4 && index === Math.floor(sources[section].length / 2)
            }
            onClick={() => {
              if (!useEndPage) {
                setIndex(index + 1);
              } else if (section < 4) {
                setSection(section + 1);
                setIndex(0);
              }
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
                  saveData();
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
        {data[section ?? 0][index].section}/IG_Page{index + 1}
        .png
      </span>
    </div>
  );
}
