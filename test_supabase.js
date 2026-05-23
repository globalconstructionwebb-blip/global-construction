require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from("projects").select("*").limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    if (data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
    } else {
      console.log("Table is empty but fetch successful.");
    }
  }
}
main();
