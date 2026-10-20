import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SettingsAdmin from "./SettingsAdmin";

export const metadata: Metadata = {
  title: "Settings & Account | HR Portal",
  description: "Manage security passcodes, account profile and portal configuration for GPS Projects Private Limited.",
  robots: { index: false, follow: false },
};

export default function SettingsAdminPage() {
  return (
    <>
      <SettingsAdmin />
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}
