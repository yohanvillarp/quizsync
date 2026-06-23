import { createBrowserRouter, Outlet } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Navbar } from "@/widgets/navbar/ui/Navbar";
import { DashboardPage } from "@/pages/dashboard/ui/DashboardPage";
import { CreateQuizPage } from "@/pages/create-quiz/ui/CreateQuizPage";
import { AdminRoute } from "@/shared/ui/AdminRoute";
import { CategoriesPage } from "@/pages/categories/ui/CategoriesPage";

// Layout principal protegido por Clerk y por Rol
function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[var(--color-high-pink)] selection:text-[var(--color-ink)]">
      <SignedIn>
        <AdminRoute>
          <Navbar />
          <Outlet />
        </AdminRoute>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "quizzes/new",
        element: <CreateQuizPage />,
      },
      {
        path: "quizzes/edit/:id",
        element: <CreateQuizPage />,
      }
    ]
  }
]);
