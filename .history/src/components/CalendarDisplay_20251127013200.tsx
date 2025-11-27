"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { verifyCalendarPassword } from "@/app/actions";
import { Lock, Music, Image as ImageIcon, AlignLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Day {
  id: string;
  dayNumber: number;
  content: string | null;
  contentType: string;
  style?: string;
  backgroundColor?: string | null;
  textColor?: string | null;
  size?: number | null;
  fontSize?: number | null;
  positionX: number;
  positionY: number;
}

interface PublicCalendar {
  id: string;
  name: string;
  backgroundUrl: string | null;
  hasPassword: boolean;
  isTest: boolean;
  defaultStyle: string;
  defaultColor: string;
  defaultTextColor: string;
  defaultSize: number;
  defaultFontSize: number;
  days: Day[];
}

export default function CalendarDisplay({
  calendar,
}: {
  calendar: PublicCalendar;
}) {
  const [isUnlocked, setIsUnlocked] = useState(!calendar.hasPassword);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verifyCalendarPassword(calendar.id, passwordInput);
    if (isValid) {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="max-w-md w-full p-8 bg-slate-800 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold mb-4 text-center">
            {calendar.name} is Locked
          </h1>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type="password"
                placeholder="Enter password"
                className="pl-10 bg-slate-700 border-slate-600 text-white"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative flex flex-col">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: calendar.backgroundUrl
            ? `url(${calendar.backgroundUrl})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(20px) brightness(0.5)",
          transform: "scale(1.1)", // Prevent blurred edges from showing white
        }}
      />

      {!calendar.backgroundUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-white opacity-20 text-4xl font-bold pointer-events-none">
          NO BACKGROUND
        </div>
      )}

      <div className="relative z-20 text-center pointer-events-none pt-8 pb-4 shrink-0">
        <h1 className="text-6xl font-bold text-white font-christmas drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          {calendar.name}
        </h1>
      </div>

      <div className="relative z-10 w-full flex-1 flex items-center justify-center p-4 min-h-0">
        <div
          className="relative shadow-2xl"
          style={{
            width: "fit-content",
            height: "fit-content",
            maxHeight: "100%",
            maxWidth: "100%",
          }}
        >
          {calendar.backgroundUrl ? (
            <img
              src={calendar.backgroundUrl}
              alt="Background"
              className="max-w-full max-h-screen object-contain block shadow-2xl"
              draggable={false}
            />
          ) : (
            // Fallback container size if no image
            <div className="w-[1000px] h-[800px] max-w-[90vw] max-h-[80vh] bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"></div>
          )}

          <div className="absolute inset-0">
            {calendar.days.map((day) => (
              <DayItem
                key={day.id}
                day={day}
                calendar={calendar}
                isTest={calendar.isTest}
                onOpen={() => setSelectedDay(day)}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedDay && (
          <DayContentModal
            day={selectedDay}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DayItem({
  day,
  calendar,
  isTest,
  onOpen,
}: {
  day: Day;
  calendar: PublicCalendar;
  isTest: boolean;
  onOpen: () => void;
}) {
  const today = new Date();
  const isDecember = today.getMonth() === 11;
  const canOpen = isTest || (isDecember && today.getDate() >= day.dayNumber);

  const [shake, setShake] = useState(false);

  const handleClick = () => {
    if (canOpen) {
      onOpen();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const dayStyle = day.style || calendar.defaultStyle || "circle";
  const bgColor = day.backgroundColor || calendar.defaultColor || "#dc2626";
  const txtColor = day.textColor || calendar.defaultTextColor || "#ffffff";
  const size = day.size || calendar.defaultSize || 6.5;
  const fontSize = day.fontSize || calendar.defaultFontSize || 40;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${day.positionX}%`,
        top: `${day.positionY}%`,
        width: `${size}%`,
        aspectRatio: "1/1",
      }}
      animate={shake ? { x: ["0%", "-5%", "5%", "-5%", "5%", "0%"] } : {}}
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={cn(
          "w-full h-full flex items-center justify-center font-bold shadow-lg transition-colors relative",
          dayStyle === "square" ? "rounded-[10%]" : "rounded-full",
          !canOpen && "opacity-80 grayscale-[0.5]"
        )}
        style={{
          backgroundColor: canOpen ? bgColor : undefined,
          color: canOpen ? txtColor : undefined,
          containerType: "size",
        }}
      >
        {/* Fallback gray for locked if desired, or keep color but dimmed */}
        {!canOpen && (
          <div
            className="absolute inset-0 bg-gray-700 rounded-inherit opacity-100 z-0 border-2 border-gray-600 flex items-center justify-center"
            style={{ borderRadius: dayStyle === "square" ? "10%" : "9999px" }}
          ></div>
        )}

        {/* Visual embellishments for circle style */}
        {canOpen && dayStyle === "circle" && (
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[25%] h-[25%] bg-gray-400 rounded-sm shadow-sm z-0 border border-gray-500" />
        )}

        <span
          className={cn(
            "relative z-10 drop-shadow-md font-christmas",
            !canOpen && "text-gray-400"
          )}
          style={{ fontSize: `${fontSize}cqw` }}
        >
          {day.dayNumber}
        </span>

        {!canOpen && (
          <Lock
            className="absolute bottom-[10%] z-10 text-gray-400"
            style={{ width: "20%", height: "20%" }}
          />
        )}
      </div>
    </motion.div>
  );
}

function DayContentModal({ day, onClose }: { day: Day; onClose: () => void }) {
  const content = day.content ? JSON.parse(day.content) : {};

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white/90 backdrop-blur-sm border-none shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Day {day.dayNumber} Content</DialogTitle>
        </VisuallyHidden>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="flex flex-col items-center text-center space-y-4 p-4"
        >
          <div className="text-4xl font-serif text-red-600 mb-2">
            Day {day.dayNumber}
          </div>

          {day.contentType === "text" && (
            <p className="text-lg leading-relaxed text-gray-800 font-medium">
              {content.text}
            </p>
          )}

          {day.contentType === "photo" && (
            <>
              {content.url && (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-inner">
                  <Image
                    src={content.url}
                    alt="Day content"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {content.text && (
                <p className="text-lg text-gray-800 mt-4">{content.text}</p>
              )}
            </>
          )}

          {day.contentType === "music" && (
            <>
              <div className="w-full bg-slate-100 p-4 rounded-full flex items-center justify-center gap-4">
                <Music className="w-8 h-8 text-blue-500 animate-pulse" />
                <span className="text-sm text-gray-500">Audio Message</span>
              </div>
              {content.url && (
                <audio
                  controls
                  src={content.url}
                  autoPlay
                  className="w-full mt-2"
                />
              )}
              {content.text && (
                <p className="text-lg text-gray-800 mt-4">{content.text}</p>
              )}
            </>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
