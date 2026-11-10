"use client";

import { useState } from "react";
import { Linkedin, RotateCw } from "lucide-react";
import userData from "@/config/userData";
import Link from "next/link";
import ProfilePortrait from "../profile-portrait";
import { GithubIcon } from "../icons";
import SoundToggle from "../sound-toggle";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";

const Header = () => {
  const [showPhoto, setShowPhoto] = useState(false);
  const { name, profession, github, twitter } = userData.personalInfo;

  return (
    <div className="w-full lg:max-w-4xl">
      <div className="p-4 pt-12 w-full mx-auto">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex flex-col items-start gap-2 justify-center">
            <ProfilePortrait showPhoto={showPhoto} />
            <Link href="/" className="flex flex-col items-start justify-start font-medium tracking-tight text-sm">
              <h1 className="text-base tracking-tight text-foreground">{name}</h1>

              <span className="text-sm -mt-1 font-normal text-muted-foreground">
                {profession}
              </span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link aria-label="GitHub" rel="noopener noreferrer" target="_blank" href={github}>
                <GithubIcon className="size-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link aria-label="LinkedIn" rel="noopener noreferrer" target="_blank" href={twitter}>
                <Linkedin className="size-4" />
              </Link>
            </Button>
            <SoundToggle />
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              className="relative size-8 p-0"
              onClick={() => setShowPhoto((current) => !current)}
              aria-label={showPhoto ? "Show mascot" : "Show actual profile picture"}
              aria-pressed={showPhoto}
              title={showPhoto ? "Flip to mascot" : "Flip to photo"}
            >
              <RotateCw className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
