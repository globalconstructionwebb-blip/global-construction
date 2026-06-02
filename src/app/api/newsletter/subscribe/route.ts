import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { z } from "zod";

// Stark input-validering med Zod
const subscribeSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validera input säkert
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Save to Supabase
    const { error } = await supabaseAdmin
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
