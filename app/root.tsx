import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import bootstrapCSS from "bootstrap/dist/css/bootstrap.min.css";

import bootstrapIcons from "bootstrap-icons/font/bootstrap-icons.css";

export const links = () => [
  { rel: "stylesheet", href: bootstrapCSS },
  { rel: "stylesheet", href: bootstrapIcons },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Invoice-App",
  viewport: "width=device-width,initial-scale=1",
});


export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
