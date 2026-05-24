import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Saknar Supabase-miljövariabler");
      return NextResponse.json(
        { error: "Serverkonfigurationsfel" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Ogiltig e-postadress" },
        { status: 400 }
      );
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("subscribers")
      .upsert({ email, active: true }, { onConflict: "email" });

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Tack för din prenumeration!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Kunde inte registrera prenumerationen. Försök igen senare." },
      { status: 500 }
    );
  }
}
