import { Play } from "lucide-react";

export default function PlayBanner() {
    return (
        <div
          className="flex md:max-w-2xl w-full justify-center items-center h-10 bg-green-500 absolute bottom-0"
          onClick={() => {
            window.open(
              "https://play.google.com/store/apps/details?id=com.ecoville.picsa"
            );
          }}
        >
          <Play size={24} className="mx-3" />
          <p>Download the app from playstore</p>
        </div>
      );
}