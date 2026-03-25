import Image from "next/image";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center px-6">
      {/* Left */}
      <div className="flex-1">
        <Link href="/" className="inline-block">
          <Image
            src="/img/logo-dqtv.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </Link>
      </div>

      {/* Right */}
      <div className="flex-1 flex justify-end items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          {/* icon */}
          <span className="text-lg">🔔</span>

          {/* badge */}
          <span
            className="
      absolute
      -top-1
      -right-1
      bg-red-500
      text-white
      text-xs
      font-semibold
      w-5
      h-5
      flex
      items-center
      justify-center
      rounded-full
      "
          >
            0
          </span>
        </button>

        <div className="w-9 h-9 rounded-full bg-gray-200" />
      </div>
    </header>
  );
}
