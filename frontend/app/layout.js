import "./globals.css";

export const metadata = {
  title: "COMPASS — Your skills. A clear path.",
  description: "COMPASS is a college-scoped skill-to-career navigation platform matching students to real-world buildable projects, staged prerequisite learning paths, auto-matched faculty mentors, and graduation portfolio automation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
