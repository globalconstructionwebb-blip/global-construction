require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Genererar återställningslänk för philip@webix.se...");
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: 'philip@webix.se',
    options: {
      redirectTo: 'https://global-construction-nine.vercel.app/admin/reset-password'
    }
  });
  
  if (error) {
    console.error("Fel vid generering:", error);
  } else {
    console.log("\n==================================================");
    console.log("KOPPIERA OCH SKICKA DENNA LÄNK TILL PHILIP:");
    console.log("==================================================");
    console.log(data.properties.action_link);
    console.log("==================================================\n");
  }
}
main();
