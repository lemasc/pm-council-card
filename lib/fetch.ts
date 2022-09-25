import { Source } from "./types";

import axios, { AxiosResponse } from "axios";

const fetchWith404 = async (
  url: string,
  fallback?: () => Promise<AxiosResponse<Blob>>
) => {
  try {
    return await axios.get<Blob>(url, {
      responseType: "blob",
    });
  } catch (err) {
    if (fallback && axios.isAxiosError(err) && err.response?.status === 404) {
      return fallback();
    } else {
      throw err;
    }
  }
};

export const fetchImage = async (data: Source) => {
  const baseUrl = `/sources/${data.section}`;
  return fetchWith404(`${baseUrl}/${data.name}.jpg`, () => {
    return fetchWith404(`${baseUrl}/${data.name}.png`, () => {
      return fetchWith404(`${baseUrl}/${data.name}/ติดบัตร.jpg`);
    });
  });
};
