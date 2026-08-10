"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AdminRecord = {
  role: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [adminData, setAdminData] = useState<AdminRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();

      try {
        // Get currently logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("AUTH USER:", user);
        console.log("AUTH ERROR:", userError);

        if (userError) {
          setErrorMessage(
            `Authentication error: ${userError.message}`
          );
          setLoading(false);
          return;
        }

        if (!user) {
          setErrorMessage("No authenticated user found.");
          setLoading(false);
          return;
        }

        setEmail(user.email ?? "");
        setUserId(user.id);

        // Check admin_users table
        const {
          data,
          error: adminError,
        } = await supabase
          .from("admin_users")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("ADMIN DATA:", data);
        console.log("ADMIN ERROR:", adminError);

        if (adminError) {
          setErrorMessage(
            `Admin database error: ${adminError.message}`
          );
          setLoading(false);
          return;
        }

        if (!data) {
          setErrorMessage(
            "No admin record was returned for this user."
          );
          setLoading(false);
          return;
        }

        setAdminData(data);

        if (data.role !== "owner") {
          setErrorMessage(
            `User is authenticated, but the role is "${data.role}" instead of "owner".`
          );
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("ADMIN CHECK FAILED:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unknown admin check error."
        );

        setLoading(false);
      }
    }

    checkAdmin();
  }, []);

  // ---------------------------------------
  // LOADING
  // ---------------------------------------

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
        }}
      >
        Checking admin access...
      </main>
    );
  }

  // ---------------------------------------
  // ERROR
  // ---------------------------------------

  if (errorMessage || !adminData) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          padding: "140px 40px 80px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              marginBottom: "30px",
            }}
          >
            Admin Access Debug
          </h1>

          <div
            style={{
              background: "#160909",
              border: "1px solid #4a2020",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "30px",
            }}
          >
            <h2
              style={{
                color: "#ff7777",
                fontSize: "20px",
                marginBottom: "15px",
              }}
            >
              Error
            </h2>

            <p
              style={{
                color: "#ffaaaa",
                lineHeight: 1.6,
              }}
            >
              {errorMessage || "Admin record not found."}
            </p>
          </div>

          <div
            style={{
              background: "#111",
              border: "1px solid #252525",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                marginBottom: "20px",
              }}
            >
              Current Session
            </h2>

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <strong>Email:</strong>

              <div
                style={{
                  color: "#888",
                  marginTop: "6px",
                  wordBreak: "break-all",
                }}
              >
                {email || "No email"}
              </div>
            </div>

            <div>
              <strong>User ID:</strong>

              <div
                style={{
                  color: "#888",
                  marginTop: "6px",
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                  fontSize: "13px",
                }}
              >
                {userId || "No user ID"}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------
  // ADMIN DASHBOARD
  // ---------------------------------------

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",

        // IMPORTANT:
        // Navbar is fixed, so the dashboard needs
        // enough space at the top.
        padding: "140px 40px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <h1
          style={{
            fontSize: "40px",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          DAO Studios Admin
        </h1>

        <p
          style={{
            color: "#888",
            marginBottom: "50px",
          }}
        >
          Welcome, {email}.
        </p>

        {/* ADMIN CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          <AdminCard
            href="/admin/content"
            title="Content"
            description="Upload, edit, publish and remove episodes and videos."
          />

          <AdminCard
            href="/admin/series"
            title="Series"
            description="Create and manage series, seasons and episodes."
          />

          <AdminCard
            href="/admin/playlists"
            title="Playlists"
            description="Create and organize playlists for your audience."
          />

          <AdminCard
            href="/admin/homepage"
            title="Homepage"
            description="Control featured content and homepage sections."
          />

          <AdminCard
            href="/admin/users"
            title="Users"
            description="Manage registered DAO Studios users."
          />

          <AdminCard
            href="/admin/settings"
            title="Settings"
            description="Manage website and platform settings."
          />
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------
// ADMIN CARD
// ---------------------------------------

function AdminCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid #242424",
          borderRadius: "18px",
          padding: "28px",
          minHeight: "160px",

          cursor: "pointer",

          transition:
            "transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.transform =
            "translateY(-4px)";
          event.currentTarget.style.borderColor =
            "#444";
          event.currentTarget.style.background =
            "#151515";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform =
            "translateY(0)";
          event.currentTarget.style.borderColor =
            "#242424";
          event.currentTarget.style.background =
            "#111";
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            marginBottom: "12px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: "#888",
            lineHeight: 1.6,
            fontSize: "14px",
          }}
        >
          {description}
        </p>
      </div>
    </Link>
  );
}