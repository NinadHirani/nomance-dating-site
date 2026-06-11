"use client";

import { useEffect, useState, type ComponentType } from "react";

const loadVisualEditsMessenger = async () => {
  const importer = new Function("modulePath", "return import(modulePath);") as (
    modulePath: string
  ) => Promise<{ VisualEditsMessenger: ComponentType<any> }>;

  const mod = await importer("orchids-visual-edits");
  return mod.VisualEditsMessenger;
};

export function VisualEditsBridge() {
  const [VisualEditsMessenger, setVisualEditsMessenger] =
    useState<ComponentType<any> | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    let active = true;

    void loadVisualEditsMessenger()
      .then((Messenger) => {
        if (active) {
          setVisualEditsMessenger(() => Messenger);
        }
      })
      .catch(() => {
        if (active) {
          setVisualEditsMessenger(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!VisualEditsMessenger) {
    return null;
  }

  return <VisualEditsMessenger />;
}