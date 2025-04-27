import { cors } from "@elysiajs/cors";

export const corsPlugin = cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
});
