require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Hämtar alla användare från Supabase Auth...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Fel vid hämtning av användare:", listError);
    return;
  }
  
  console.log(`Hittade ${users.length} användare.`);
  const philip = users.find(u => u.email.toLowerCase() === 'philip@webix.se');
  
  if (!philip) {
    console.error("Kunde inte hitta användaren philip@webix.se i listan.");
    console.log("Här är e-postadresserna som finns:");
    users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`));
    return;
  }
  
  console.log(`Hittade Philip! UID: ${philip.id}`);
  
  const tempPassword = "PasswordWebix2026!";
  console.log("Uppdaterar lösenordet...");
  
  const { data, error: updateError } = await supabase.auth.admin.updateUserById(philip.id, {
    password: tempPassword,
    email_confirm: true
  });
  
  if (updateError) {
    console.error("Fel vid uppdatering:", updateError);
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
