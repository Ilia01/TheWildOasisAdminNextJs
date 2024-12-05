import Logout from "../_authentication/Logout";
import { HiOutlineUser } from "react-icons/hi2";
import DarkModeToggle from "./DarkModeToggle";
import Link from "next/link";

function HeaderMenu() {
  return (
    <ul className="flex gap-[0.4rem]">
      <li>
        <Link href="/account">
          <button className="rounded-md border-none bg-none p-[0.6rem] text-[2.2rem] text-indigo-600 hover:bg-gray-100 hover:dark:bg-gray-800">
            <HiOutlineUser />
          </button>
        </Link>
      </li>

      <li>
        <DarkModeToggle />
      </li>

      <li>
        <Logout />
      </li>
    </ul>
  );
}

export default HeaderMenu;