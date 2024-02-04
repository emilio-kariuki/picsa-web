import logo from "@/assets/logo.png";
import Image from "next/image";

export function PLogo() {
  return <Image src={logo} alt="Picsa" className="w-[40px] h-[40px]" />;
}
