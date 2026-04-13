import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const courses = await supabase.from("courses").select("*");
  const questions = await supabase.from("questions").select("syllabus_code").limit(20);

  const enrollments = user?.id
    ? await supabase.from("enrollments").select("*").eq("student_id", user.id)
    : { data: null, error: null };

  const attempts = user?.id
    ? await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("student_id", user.id)
        .limit(10)
    : { data: null, error: null };

  return NextResponse.json({
    userId: user?.id ?? null,
    userError,
    isAuthenticated: Boolean(user?.id),
    enrollments: enrollments.data,
    enrollmentError: enrollments.error,
    allCourses: courses.data,
    coursesError: courses.error,
    sampleQuestionSyllabusCodes: [
      ...new Set((questions.data ?? []).map((q) => q.syllabus_code)),
    ],
    questionsError: questions.error,
    quizAttempts: attempts.data,
    attemptsError: attempts.error,
  });
}
