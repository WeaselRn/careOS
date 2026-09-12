import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ExamplePage from "./pages/ExamplePage";
import Page from "./components/Page";

/**
 * Standalone harness — NOT the federation entrypoint.
 * The host only ever imports `./manifest`. This exists so `vite preview` serves something
 * and so the plugin can be developed in isolation.
 */
window.CARE_API_URL ??= "http://127.0.0.1:9000";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Page>
        <ExamplePage />
      </Page>
    </QueryClientProvider>
  </StrictMode>,
);
