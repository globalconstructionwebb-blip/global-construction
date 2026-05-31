"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Kontrollera om det finns en aktiv session (som Supabase automatiskt sätter från hash-token i URL-en)
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasSession(true);
          setVerifying(false);
        } else {
          // Lyssna på auth-förändringar ifall sessionen tar en kort stund att etableras från URL-hash
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              setHasSession(true);
            }
            setVerifying(false);
          });
          
          // Om ingen session hittas efter 3 sekunder, visa felmeddelande
          const timer = setTimeout(() => {
            setVerifying(false);
          }, 3000);

          return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
          };
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setVerifying(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken långt.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }

    setLoading(true);

    try {
      // Uppdatera lösenordet för den nuvarande inloggade/inbjudna användaren
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Kunde inte spara lösenordet.");
      } else {
        setSuccess(true);
        // Logga ut från Supabase-sessionen så att användaren måste logga in via NextAuth-formuläret
        await supabase.auth.signOut();
      }
    } catch (err) {
      setError("Ett oväntat fel uppstod vid uppdatering av lösenordet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B263B] px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Global Construction"
            width={180}
            height={50}
            className="mx-auto brightness-0"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-outfit">
            Välj lösenord
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ange ditt nya lösenord för att aktivera ditt konto och få tillgång till adminpanelen.
          </p>
        </div>

        {verifying ? (
          <div className="text-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B263B] mx-auto"></div>
            <p className="text-gray-600 text-sm">Verifierar din inbjudningslänk...</p>
          </div>
        ) : !hasSession && !success ? (
          <div className="mt-8 space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-r-md">
              <p className="font-semibold">Ogiltig eller utgången aktiveringslänk</p>
              <p className="mt-1">
                Denna länk är inte längre giltig. Kontrollera att du klickade på rätt länk i din e-post, eller kontakta din administratör för en ny inbjudan.
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/login")}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#1B263B] hover:bg-blue-700 transition-all"
            >
              TILL INLOGGNINGEN
            </button>
          </div>
        ) : success ? (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-sm rounded-r-md">
              <p className="font-semibold font-outfit">Ditt lösenord har sparats!</p>
              <p className="mt-1">
                Kontoaktiveringen är klar. Du kan nu logga in på adminpanelen med din e-postadress och ditt nya lösenord.
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/login")}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#1B263B] hover:bg-blue-700 transition-all font-outfit"
            >
              LOGGA IN PÅ ADMINPANELEN
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-r-md">
                {error}
              </div>
            )}
            
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="password-reset" className="block text-sm font-medium text-gray-700 mb-1">
                  Välj nytt lösenord
                </label>
                <input
                  id="password-reset"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Minst 6 tecken"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Bekräfta nytt lösenord
                </label>
                <input
                  id="password-confirm"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Bekräfta lösenord"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#1B263B] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 font-outfit"
              >
                {loading ? "Sparar..." : "AKTIVERA KONTO"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
