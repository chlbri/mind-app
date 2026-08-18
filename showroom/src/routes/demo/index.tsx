import { createFileRoute } from "@tanstack/solid-router";
import { Flow } from "./-index.context";

export const Route = createFileRoute("/demo/")({ component: Flow });
