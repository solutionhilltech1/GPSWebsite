import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "HR Media Operations Portal",
  description: "Internal media and gallery management portal for GPS Prime Projects.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <>
      <AdminClient />
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}
