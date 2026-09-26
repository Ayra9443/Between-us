const SUPABASE_URL =
    "https://foiugwvndheatzznrrpl.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaXVnd3ZuZGhlYXR6em5ycnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MzE4MjUsImV4cCI6MjEwMTQwNzgyNX0.wr82Ybn61WegKzwg83-wUor95UGpaV2BBR3uoN--C68";

window.supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

console.log(
    "Supabase connected!",
    window.supabaseClient
);