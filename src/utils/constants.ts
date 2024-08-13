import { Rethink_Sans, IM_Fell_English } from "next/font/google";

export const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;

export const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL;

export const getBaseUrl = () => {
  if (ENV === "production") {
    return "https://uk-political-opinions.vercel.app/";
  } else if (ENV === "preview") {
    return `https://${VERCEL_URL}`;
  } else {
    return "http://localhost:3000";
  }
};

// export const inter = Inter({ subsets: ["latin"] });
export const inter = Rethink_Sans({ subsets: ["latin"] });
export const kaiseiHarunoUmi = IM_Fell_English({ weight: "400", subsets: ["latin"] });
