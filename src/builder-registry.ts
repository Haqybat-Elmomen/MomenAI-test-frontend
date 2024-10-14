"use client";
import { builder, Builder } from "@builder.io/react";
import MouminAI from "./components/layouts/MouminAI/MouminAI";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(MouminAI, {
  name: "MouminAI",
});
