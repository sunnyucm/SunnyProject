import { MantineProvider, createEmotionCache } from "@mantine/core";
import { cssBundleHref } from "@remix-run/css-bundle";
import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { StylesPlaceholder } from "@mantine/remix";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { CartProvider } from "~/context/CartContext";

const appendCache = createEmotionCache({ key: "mantine", prepend: false });

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export type RootLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  return json({ user });
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "eStore",
  viewport: "width=device-width,initial-scale=1",
});

export function Document({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <MantineProvider withNormalizeCSS emotionCache={appendCache}>
      <html lang="en" className="h-full">
        <head>
          {title ? <title>{title}</title> : null}
          <Meta />
          <Links />
          <StylesPlaceholder />
        </head>
        <body className="h-full">
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </MantineProvider>
  );
}

export default function App() {
  return (
    <Document>
      <ModalsProvider>
        <NotificationsProvider autoClose={2000} limit={3}>
          <CartProvider>
            <Outlet />
          </CartProvider>
        </NotificationsProvider>
      </ModalsProvider>
    </Document>
  );
}
