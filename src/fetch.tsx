const urlserver: string = "http://localhost:5000";
const api: string = "/api";
import { getCookie } from "typescript-cookie";
export const serverUrl: string = urlserver;
export interface LoginParams {
  userid: string;
  password: string;
}
export async function fetchLogin(
  url: string,
  params: LoginParams
): Promise<any> {
  try {
    const response = await fetch(urlserver + api + url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      return { status: "false" };
    }

    const data = await response.json();
    return { data: data, status: true };
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    throw error;
  }
}

export interface Postparams {
  offset: number;
  limit: number;
  search: string;
  section: string;
}

export interface Tagsparams {
  postId: number;
}

export async function fetchData(
  method: string,
  url: string,
  params: Postparams | Tagsparams
): Promise<any> {
  console.log(urlserver + url);
  try {
    const response = await fetch(urlserver + api + url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${
          getCookie("userid") + ":" + getCookie("token")
        }`,
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      return { status: "false", err: response };
    }

    const data = await response.json();
    return { data: data, status: true };
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    throw error;
  }
}

export async function fetchSeedData(): Promise<any> {
  try {
    const response = await fetch(urlserver + "/insert", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { status: "false" };
    }

    const data = await response.json();
    return { data: data, status: true };
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    throw error;
  }
}
