import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SocialsAdmin from "./SocialsAdmin";

export const metadata: Metadata = {
  title: "Social Media & Footer Operations | HR Portal",
  description: "Manage social media links and footer contact details for GPS Projects Private Limited.",
  robots: { index: false, follow: false },
};

export default function SocialsAdminPage() {
  return (
    <>
      <SocialsAdmin />
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}
