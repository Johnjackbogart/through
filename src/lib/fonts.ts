import { BBH_Sans_Bartle } from "next/font/google";
import { Baskervville } from "next/font/google";
import { IBM_Plex_Sans } from "next/font/google";

export const bbhBartle = BBH_Sans_Bartle({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const baskervville = Baskervville({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});
