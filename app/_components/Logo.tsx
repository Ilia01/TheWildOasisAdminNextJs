"use client";

import Image from "next/image";
import { useDarkMode } from "../_context/DarkModeContext";

function Logo() {
  const { isDarkMode } = useDarkMode();

  const src = isDarkMode ? "/logo-dark.png" : "/logo-light.png";

  return (
    <div className="flex items-center justify-center">
      <Image height={140} width={140} src={src} alt="Logo" />
    </div>
  );
}

export default Logo;
