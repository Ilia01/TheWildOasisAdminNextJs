"use client";

import { useUser } from "./useUser";
import Image from "next/image";

function UserAvatar() {
  const { user } = useUser();
  // const { fullName, avatar } = user?.user_metadata; #ERROR#

  return (
    <div className="flex items-center gap-[1.2rem] text-[1.4rem] font-medium text-gray-600">
      <Image
        className="block aspect-square w-[3.6rem] rounded-[50%] object-cover object-center outline-2 outline-[var(--color-grey-100)]"
        // src={avatar || "default-user.jpg"}
        // alt={`Avatar of ${fullName}`}
      />
      {/* <span>{fullName}</span> */}
    </div>
  );
}

export default UserAvatar;
