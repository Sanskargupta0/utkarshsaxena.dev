"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Mascot } from "page-mascot";
import styles from "./profile-portrait.module.css";

export default function ProfilePortrait({ showPhoto }: { showPhoto: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const mascotInteractive = isHome && !showPhoto;

  useEffect(() => {
    // Update every tab-icon candidate so browsers cannot choose the other portrait.
    const originals = new Map<HTMLLinkElement, Record<string, string | null>>();
    const attributes = {
      href: showPhoto ? "/icons/profile-192.png" : "/icons/mascot-192.png",
      type: "image/png",
      sizes: "192x192",
    };
    const syncIcons = () => {
      for (const icon of document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="shortcut icon"]',
      )) {
        if (!originals.has(icon)) {
          originals.set(icon, {
            href: icon.getAttribute("href"),
            type: icon.getAttribute("type"),
            sizes: icon.getAttribute("sizes"),
          });
        }
        for (const [name, value] of Object.entries(attributes)) {
          if (icon.getAttribute(name) !== value) icon.setAttribute(name, value);
        }
      }
    };
    syncIcons();
    // Next can stream new metadata links after a client-side navigation.
    const observer = new MutationObserver(syncIcons);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href", "rel", "type", "sizes"],
    });

    return () => {
      observer.disconnect();
      for (const [icon, attributes] of originals) {
        for (const [name, value] of Object.entries(attributes)) {
          if (value === null) icon.removeAttribute(name);
          else icon.setAttribute(name, value);
        }
      }
    };
  }, [showPhoto]);

  return (
    <div className={styles.portrait}>
        <div className={styles.flipper} data-flipped={showPhoto}>
          <div className={styles.front} aria-hidden={!mascotInteractive} inert={!mascotInteractive}>
            <div className={styles.mascot}>
              <Mascot
                directions="/mascots/utkarsh-directions.webp"
                reactions="/mascots/utkarsh-reactions.webp"
                size={104}
                label="Utkarsh mascot"
                className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </div>
          </div>
          <div className={styles.back} aria-hidden={!showPhoto} inert={!showPhoto}>
            <Image
              src="/profile.png"
              alt="Utkarsh Saxena"
              width={80}
              height={80}
              className="size-20 rounded-md object-cover select-none ring-[0.6px] ring-inset ring-black/10 dark:ring-white/15"
            />
          </div>
        </div>
      {!mascotInteractive && <Link
        href="/"
        aria-label="Return home"
        className="absolute inset-0 z-10 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />}
      <span className="sr-only" role="status">
        {showPhoto ? "Profile photo shown" : "Mascot shown"}
      </span>
    </div>
  );
}
