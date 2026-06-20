import { app } from "~/api";

export const GET = ({ request }: { request: Request }) => app.fetch(request);
// export const POST = ({ request }: { request: Request }) => app.fetch(request);
// export const PUT = ({ request }: { request: Request }) => app.fetch(request);
// export const DELETE = ({ request }: { request: Request }) => app.fetch(request);
// export const PATCH = ({ request }: { request: Request }) => app.fetch(request);
