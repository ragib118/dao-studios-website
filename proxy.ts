import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(
                        ({ name, value }) => {
                            request.cookies.set(
                                name,
                                value
                            );
                        }
                    );

                    response = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(
                        ({ name, value, options }) => {
                            response.cookies.set(
                                name,
                                value,
                                options
                            );
                        }
                    );
                },
            },
        }
    );

    /*
     * Refresh the Supabase authentication session.
     *
     * This keeps the user's login session alive
     * while they navigate around DAO Studios.
     */
    await supabase.auth.getUser();

    return response;
}

export const config = {
    matcher: [
        /*
         * Run the proxy on all application routes,
         * except Next.js internals and static files.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico|css|js)$).*)",
    ],
};