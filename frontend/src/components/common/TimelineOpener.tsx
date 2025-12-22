import { useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

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
        <Clock size={22} className="text-blue-600" />
      </motion.div>

      {/* Animated pointer UNTIL clicked */}
      {!clicked && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: [0, -5, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-38px] top-1/2 -translate-y-1/2 text-blue-500 text-xl"
        >
          👉
        </motion.div>
      )}
    </div>
  );
}
