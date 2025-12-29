"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "#/button";
import { ThemeToggle } from "&/theme-toggle";
import { baskervville } from "@/lib/fonts";
import { ibmPlexSans } from "@/lib/fonts";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinkClassName =
    "relative inline-flex w-fit items-center pb-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md ">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 p-4 border-b border-border/50">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Go to home page"
            onClick={closeMenu}
          >
            <Image
              src="/logo.svg"
              alt="Through logo"
              width={32}
              height={32}
              className="w-12 h-12 bg-white/75 rounded-sm p-1 border-white"
            />
            <span
              className={`${baskervville.className} font-semibold text-lg text-foreground`}
            >
              Through.tech
            </span>
          </Link>

          <nav
            className={`${ibmPlexSans.className} hidden md:flex items-center gap-8`}
          >
            <a href="#services" className={navLinkClassName}>
              Services
            </a>
            <a href="#portfolio" className={navLinkClassName}>
              Portfolio
            </a>
            <a href="#success-stories" className={navLinkClassName}>
              About
            </a>
            <a href="#contact" className={navLinkClassName}>
              Contact
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button
              asChild
              className={`${baskervville.className} bg-primary text-primary-foreground hover:bg-primary/90`}
            >
              <a href="#contact">Get Started</a>
            </Button>
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/90 backdrop-blur-md">
            <nav className={`${ibmPlexSans.className} flex flex-col gap-4`}>
              <a
                href="#services"
                onClick={closeMenu}
                className={navLinkClassName}
              >
                Services
              </a>
              <a
                href="#portfolio"
                onClick={closeMenu}
                className={navLinkClassName}
              >
                Portfolio
              </a>
              <a
                href="#success-stories"
                onClick={closeMenu}
                className={navLinkClassName}
              >
                About
              </a>
              <a
                href="#contact"
                onClick={closeMenu}
                className={navLinkClassName}
              >
                Contact
              </a>
              <ThemeToggle showLabel onAfterToggle={closeMenu} />
              <Button
                asChild
                className={`${baskervville.className} bg-primary text-primary-foreground hover:bg-primary/90 w-full`}
              >
                <a href="#contact" onClick={closeMenu}>
                  Get Started
                </a>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
