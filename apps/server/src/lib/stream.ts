import { StreamChat } from "stream-chat";

import { env } from "@/env";

export const stream = new StreamChat(env.STREAM_API_KEY, env.STREAM_API_SECRET);
