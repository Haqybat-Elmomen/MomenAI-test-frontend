"use client";
import { builder, Builder } from "@builder.io/react";
import MouminAI from "./components/layouts/MouminAI/MouminAI";
import MyComponent from "./components/chat/MyComponent";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(MouminAI, {
  name: "MouminAI",
});

Builder.registerComponent(MyComponent, {
  name: "chat-screen",
});
