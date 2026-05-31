require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const uid = "0032aabf-1ca6-47a8-ac13-d49be4341149";
  const tempPassword = "PasswordWebix2026!";
  
  console.log(`Uppdaterar lösenord för user ${uid} (philip@webix.se)...`);
  
  const { data, error } = await supabase.auth.admin.updateUserById(uid, {
    password: tempPassword,
    email_confirm: true
  });
  
  if (error) {
    console.error("Fel vid uppdatering av lösenord:", error);
  } else {
    console.log("==================================================");
    console.log("LÖSENORDET UPPDATERAT UTAN PROBLEM!");
    console.log("==================================================");
    console.log("E-post: philip@webix.se");
    console.log(`Lösenord: ${tempPassword}`);
    console.log("==================================================");
    console.log("Be Philip att gå till inloggningssidan direkt:");
    console.log("https://global-construction-nine.vercel.app/admin/login");
    console.log("==================================================");
  }
}
main();
