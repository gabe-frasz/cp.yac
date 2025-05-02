import swagger from "@elysiajs/swagger";

export const openApiPlugin = swagger({
  provider: "scalar",
  path: "/openapi",
  autoDarkMode: true,
});
