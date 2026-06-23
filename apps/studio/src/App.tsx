import { RouterProvider } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { router } from "./app/router/router";

// Tu clave pública de Clerk (Se debe definir en .env.local)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

import { ClerkAxiosInterceptor } from "@/shared/api/ClerkAxiosInterceptor";
import { GlobalAlert } from "@/shared/ui/GlobalAlert/GlobalAlert";

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ClerkAxiosInterceptor>
        <GlobalAlert />
        <RouterProvider router={router} />
      </ClerkAxiosInterceptor>
    </ClerkProvider>
  );
}

export default App;
