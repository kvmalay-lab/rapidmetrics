import { getRouter } from "./router";
import { renderToString } from "react-dom/server";

export default async function render(url: string) {
  const router = getRouter();
  router.update({
    location: url,
  });

  const html = renderToString(router.component);
  return html;
}
