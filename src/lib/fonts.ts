import { Inter, Rubik_Bubbles, Quicksand, Roboto } from "next/font/google";

const rubiks = Rubik_Bubbles({
  weight: "400",
  style: "normal",
  subsets: ["cyrillic"],
});

const inter = Inter({
  weight: "500",
  style: "normal",
  subsets: ["cyrillic"],
});

const interRegular = Inter({
    weight: "400",
    style: "normal",
    subsets: ["cyrillic"],
  });

const quickSand = Quicksand({
    weight: "700",
    style: "normal",
    subsets: ["latin"],
})

const quickSandRegular = Quicksand({
    weight: "500",
    style: "normal",
    subsets: ["latin"],
})

const roboto = Roboto({
    weight: "700",
    style: "normal",
    subsets: ["latin"],
})


export { rubiks, inter, quickSand, roboto, interRegular, quickSandRegular };
