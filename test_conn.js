
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gufoabgzhjskzeuonere.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Zm9hYmd6aGpza3pldW9uZXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjQxMjksImV4cCI6MjA4MzkwMDEyOX0.9nTOOwT-GSusDinHxRP3SdncguvvGAW3rk3E0oBh7dI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing Supabase Connection (CommonJS)...");

    try {
        console.log("Attempting to fetch profiles...");
        const { data, error } = await supabase.from('profiles').select('*').limit(5);
        if (error) {
            console.error("Error fetching profiles:", error);
        } else {
            console.log("Successfully fetched profiles:", data);
        }

        console.log("Attempting to fetch students...");
        const { data: students, error: studentError } = await supabase.from('students').select('*').limit(5);
        if (studentError) {
            console.error("Error fetching students:", studentError);
        } else {
            console.log("Successfully fetched students:", students);
        }

    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

testConnection();
