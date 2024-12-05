"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Select from "./Select";

type SortByProps = {
  options: { value: string; label: string }[];
};

function SortBy({ options }: SortByProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sortBy = searchParams.get("sortBy") || "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", e.target.value);

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Select
      options={options}
      value={sortBy}
      type="white"
      onChange={handleChange}
    />
  );
}

export default SortBy;
