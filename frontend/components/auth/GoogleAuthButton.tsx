"use client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function GoogleAuthButton() {
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // 1. Send the massive Google ID Token to our backend
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        googleToken: credentialResponse.credential,
      });

      // 2. Assuming our backend authenticates it and responds with the User data/JWT
      console.log("Google Login Success!", res.data);

      // Save user to localStorage (matches standard login behavior)
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect to the dashboard/homepage
      window.location.href = "/";

    } catch (error: any) {
      console.error("Google authentication failed", error.response?.data || error.message);
      alert("Failed to sign in with Google.");
    }
  };

  return (
    <div className="flex justify-center w-full my-4">
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.log("Login Failed");
          }}
        // useOneTap // Optional: Displays a stylish pop-up slide for rapid login
        />
      </GoogleOAuthProvider>
    </div>
  );
}
