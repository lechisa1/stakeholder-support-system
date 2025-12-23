import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";

interface TimelineOpenerProps {
  onOpen: () => void;
}

export default function TimelineOpener({ onOpen }: TimelineOpenerProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    onOpen();
  };

  return (
    <div
      className="relative flex items-center gap-2 cursor-pointer"
      onClick={handleClick}
    >
      {/* Clock Icon with light rotation + blue border */}
      <motion.div
        animate={{
          rotate: clicked ? 0 : [0, 10, -10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: clicked ? 0 : Infinity,
          ease: "easeInOut",
        }}
      >
        <ArrowRightLeft size={22} className="text-blue-600" />
      </motion.div>
    </div>
  );
}
