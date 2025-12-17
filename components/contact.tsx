"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function Contact() {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <section
      id="contact"
      className="scroll-mt-24 py-20 lg:py-32 relative z-20 bg-muted/20"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto bg-card/60 backdrop-blur-md rounded-2xl p-8 sm:p-10 lg:p-12 border-2 border-primary/40">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-balance">
              Contact us
            </h2>
            <p className="text-muted-foreground mb-8 text-pretty leading-relaxed">
              Tell us what you’re building and we’ll follow up within 1–2 business
              days.
            </p>
          </div>

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-muted-foreground">Name</span>
                <input
                  required
                  name="name"
                  autoComplete="name"
                  className="h-10 rounded-md border border-border bg-background/40 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  placeholder="Jane Doe"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-muted-foreground">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="h-10 rounded-md border border-border bg-background/40 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  placeholder="jane@company.com"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm text-muted-foreground">
                What can we help with?
              </span>
              <textarea
                required
                name="message"
                rows={5}
                className="rounded-md border border-border bg-background/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                placeholder="A short description of your project, goals, and timeline…"
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
              <Button
                type="submit"
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Send message
              </Button>
              {submitted ? (
                <p className="text-sm text-muted-foreground">
                  Thanks — we’ll be in touch shortly.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Or email{" "}
                  <a className="underline hover:text-foreground" href="mailto:hello@through.tech">
                    hello@through.tech
                  </a>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
